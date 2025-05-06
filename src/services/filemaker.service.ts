import axios, { AxiosInstance } from "axios";
import https from "https";
import fs from "fs";
import path from "path";
import TokenManager from "../utils/tokenManager";
import FormData from "form-data";
import moment from "moment-timezone";
import { sanitizeParameters, namespace } from "../utils/utils";
import { Readable } from "stream";

interface FileMakerCredentials {
  fm_server: string;
  fm_database: string;
  fm_user: string;
  fm_password: string;
}

interface FileMakerResponse {
  success: boolean;
  dataInfo?: {
    database: string;
    layout: string;
    table: string;
    totalRecordCount: number;
    foundCount: number;
    returnedCount: number;
  };
  data?: any[];
  [key: string]: any;
}

interface FileMakerParameters {
  script?: string;
  "script.param"?: string;
  "script.prerequest"?: string;
  "script.prerequest.param"?: string;
  "script.presort"?: string;
  "script.presort.param"?: string;
  request?: any;
  merge?: boolean;
  [key: string]: any;
}

interface FileMakerFile {
  buffer: Buffer;
  name: string;
}

interface FileMakerScript {
  name: string;
  param?: string | object;
}

function toArray(query: any): any[] {
  if (Array.isArray(query)) return query;
  if (typeof query === "object" && query !== null) {
    return [query];
  }
  return [{}];
}

// Helper function to convert values to strings
function toStrings(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((item) => toStrings(item));
  }
  if (obj !== null && typeof obj === "object") {
    return Object.keys(obj).reduce((acc: any, key) => {
      acc[key] = obj[key] !== undefined ? String(obj[key]) : "";
      return acc;
    }, {});
  }
  return obj !== undefined ? String(obj) : "";
}

class FileMakerService {
  private timezone: string;
  private maxRetries: number;
  private tokenManager: TokenManager;
  private axiosInstance: AxiosInstance;

  constructor() {
    this.timezone = "America/Chicago";
    this.maxRetries = 3;
    this.tokenManager = new TokenManager();

    // Create axios instance with SSL verification disabled
    this.axiosInstance = axios.create({
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 600000, // 10 minutes in milliseconds
    });
  }

  private formatLogTime(date: Date): string {
    return moment(date).tz(this.timezone).format("YYYY-MM-DD HH:mm:ss");
  }

  // Helper method to build the FileMaker Data API URL
  private buildUrl(endpoint: string): string {
    return `https://${process.env.FILEMAKER_SERVER}/fmi/data/v2/databases/${process.env.FILEMAKER_DATABASE}/${endpoint}`;
  }

  // Helper method to handle errors
  private handleError(error: any, operation: string): never {
    const errorMessage =
      error.response?.data?.messages?.[0]?.message || error.message;
    const statusCode = error.response?.status;
    const requestUrl = error.config?.url;
    const requestMethod = error.config?.method;
    const requestData = error.config?.data;

    console.error(`${this.formatLogTime(new Date())} FileMaker API Error:
            Operation: ${operation}
            URL: ${requestUrl}
            Method: ${requestMethod}
            Status: ${statusCode}
            Request Data: ${requestData}
            Error: ${errorMessage}
            Stack: ${error.stack}`);

    throw new Error(`FileMaker ${operation} failed: ${errorMessage}`);
  }

  /**
   * Cleanup method to handle any necessary cleanup operations
   * This is a no-op for now but can be extended if needed
   */
  async destroy(): Promise<void> {
    // Cleanup any resources if needed
    return Promise.resolve();
  }

  /**
   * Makes an authenticated request to FileMaker
   * @param {Function} requestFn - The request function to execute
   * @returns {Promise<any>} The response from the request
   */
  async makeAuthenticatedRequest<T>(
    requestFn: (token: string) => Promise<T>
  ): Promise<T> {
    if (!requestFn || typeof requestFn !== "function") {
      throw new Error("Invalid request function provided");
    }

    return await this.tokenManager.makeAuthenticatedRequest(requestFn);
  }

  /**
   * Creates a record in FileMaker
   * @param {String} layout - The layout to use when creating a record
   * @param {Object} data - The data to use when creating a record
   * @param {Object} [parameters={}] - Optional request parameters
   * @returns {Promise<Object>} The created record
   */
  async create(
    layout: string,
    data: any = {},
    parameters: FileMakerParameters = {}
  ): Promise<FileMakerResponse> {
    if (!layout) {
      throw new Error("Layout name is required");
    }
    if (!data || typeof data !== "object") {
      throw new Error("Valid data object is required");
    }

    // Prepare the request data structure
    let requestData: any = {};

    // If data has fieldData or portalData, use it as is
    if (data.fieldData || data.portalData) {
      requestData = { ...data };
    } else {
      // If no fieldData or portalData, wrap the data in fieldData
      requestData = {
        fieldData: { ...data },
      };
    }

    // Sanitize parameters for the request
    const sanitizedParams = sanitizeParameters(parameters, [
      "portalData",
      "script",
      "script.param",
      "script.prerequest",
      "script.prerequest.param",
      "script.presort",
      "script.presort.param",
      "request",
    ]);

    // Merge with sanitized parameters
    requestData = {
      ...requestData,
      ...sanitizedParams,
    };

    return await this.makeAuthenticatedRequest(async (token) => {
      console.log(
        `${this.formatLogTime(new Date())} make request to filemaker `,
        {
          url: this.buildUrl(`layouts/${layout}/records`),
          requestData,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const response = await this.axiosInstance.post(
        this.buildUrl(`layouts/${layout}/records`),
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data || !response.data.response) {
        throw new Error("Invalid response from FileMaker server ");
      }

      // Handle merge operation if specified in parameters
      if (parameters.merge) {
        return {
          success: true,
          ...Object.assign(data, response.data.response),
        };
      }

      return {
        success: true,
        ...response.data.response,
      };
    });
  }

  /**
   * Updates a record in FileMaker
   * @param {String} layout - The layout to use when editing the record
   * @param {String} recordId - The FileMaker internal record ID
   * @param {Object} data - The data to use when editing a record
   * @param {Object} [parameters={}] - Optional request parameters
   * @returns {Promise<Object>} The updated record
   */
  async edit(
    layout: string,
    recordId: string,
    data: any,
    parameters: FileMakerParameters = {}
  ): Promise<FileMakerResponse> {
    if (!layout) {
      throw new Error("Layout name is required");
    }
    if (!recordId) {
      throw new Error("Record ID is required");
    }
    if (!data || typeof data !== "object") {
      throw new Error("Valid data object is required");
    }

    // Prepare the request data structure
    let requestData: any = {};

    // If data has fieldData or portalData, use it as is
    if (data.fieldData || data.portalData) {
      requestData = { ...data };
    } else {
      // If no fieldData or portalData, wrap the data in fieldData
      requestData = {
        fieldData: { ...data },
      };
    }

    // Sanitize parameters for the request
    const sanitizedParams = sanitizeParameters(parameters, [
      "portalData",
      "modId",
      "script",
      "script.param",
      "script.prerequest",
      "script.prerequest.param",
      "script.presort",
      "script.presort.param",
      "request",
    ]);

    // Merge with sanitized parameters
    requestData = {
      ...requestData,
      ...sanitizedParams,
    };

    return await this.makeAuthenticatedRequest(async (token) => {
      console.log(
        `${this.formatLogTime(new Date())} make request to filemaker `,
        {
          url: this.buildUrl(`layouts/${layout}/records/${recordId}`),
          requestData,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const response = await this.axiosInstance.patch(
        this.buildUrl(`layouts/${layout}/records/${recordId}`),
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data || !response.data.response) {
        throw new Error("Invalid response from FileMaker server");
      }

      // Handle merge operation if specified in parameters
      if (parameters.merge) {
        return {
          success: true,
          ...Object.assign(
            data,
            { recordId: recordId },
            response.data.response
          ),
        };
      }

      return {
        success: true,
        ...response.data.response,
      };
    });
  }

  /**
   * Deletes a record from FileMaker
   * @param {String} layout - The layout to use when deleting the record
   * @param {String} recordId - The FileMaker internal record ID
   * @param {Object} [parameters={}] - Optional request parameters
   * @returns {Promise<Object>} The delete result
   */
  async delete(
    layout: string,
    recordId: string,
    parameters: FileMakerParameters = {}
  ): Promise<FileMakerResponse> {
    if (!layout) {
      throw new Error("Layout name is required");
    }
    if (!recordId) {
      throw new Error("Record ID is required");
    }

    return await this.makeAuthenticatedRequest(async (token) => {
      console.log(
        `${this.formatLogTime(new Date())} make request to filemaker `,
        {
          url: this.buildUrl(`layouts/${layout}/records/${recordId}`),
          parameters,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const response = await this.axiosInstance.delete(
        this.buildUrl(`layouts/${layout}/records/${recordId}`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          data: sanitizeParameters(parameters, [
            "script",
            "script.param",
            "script.prerequest",
            "script.prerequest.param",
            "script.presort",
            "script.presort.param",
            "request",
          ]),
        }
      );

      if (!response.data || !response.data.response) {
        throw new Error("Invalid response from FileMaker server");
      }

      return {
        success: true,
        ...response.data.response,
      };
    });
  }

  /**
   * Gets a record from FileMaker
   * @param {String} layout - The layout to use when retrieving the record
   * @param {String} recordId - The FileMaker internal record ID
   * @param {Object} [parameters={}] - Optional request parameters including scripts
   * @returns {Promise<Object>} The record
   */
  async get(
    layout: string,
    recordId: string,
    parameters: FileMakerParameters = {}
  ): Promise<FileMakerResponse> {
    if (!layout) {
      throw new Error("Layout name is required");
    }
    if (!recordId) {
      throw new Error("Record ID is required");
    }

    // Handle script parameters
    const requestParams = toStrings(
      sanitizeParameters(namespace(parameters), [
        "script",
        "script.param",
        "script.prerequest",
        "script.prerequest.param",
        "script.presort",
        "script.presort.param",
        "layout.response",
        "portal",
        "_offset.*",
        "_limit.*",
        "request",
      ])
    );

    return await this.makeAuthenticatedRequest(async (token) => {
      console.log(
        `${this.formatLogTime(new Date())} make request to filemaker `,
        {
          url: this.buildUrl(`layouts/${layout}/records/${recordId}`),
          parameters: requestParams,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const response = await this.axiosInstance.get(
        this.buildUrl(`layouts/${layout}/records/${recordId}`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          params: requestParams,
        }
      );

      if (!response.data || !response.data.response) {
        throw new Error("Invalid response from FileMaker server");
      }

      // Handle merge operation if specified in parameters
      if (parameters.merge) {
        return {
          success: true,
          ...Object.assign({ recordId: recordId }, response.data.response),
        };
      }

      return {
        success: true,
        ...response.data.response,
      };
    });
  }

  /**
   * Lists records from a layout
   * @param {String} layout - The layout to use when listing records
   * @param {Object} [parameters={}] - Optional request parameters
   * @returns {Promise<Object>} The list of records
   */
  async list(
    layout: string,
    parameters: FileMakerParameters = {}
  ): Promise<FileMakerResponse> {
    if (!layout) {
      throw new Error("Layout name is required");
    }

    // Sanitize parameters for the request
    const requestParams = toStrings(
      sanitizeParameters(namespace(parameters), [
        "_limit",
        "_offset",
        "_sort",
        "portal",
        "script",
        "script.param",
        "script.prerequest",
        "script.prerequest.param",
        "script.presort",
        "script.presort.param",
        "layout.response",
        "_offset.*",
        "_limit.*",
        "request",
      ])
    );

    return await this.makeAuthenticatedRequest(async (token) => {
      console.log(
        `${this.formatLogTime(new Date())} make request to filemaker `,
        {
          url: this.buildUrl(`layouts/${layout}/records`),
          parameters: requestParams,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const response = await this.axiosInstance.get(
        this.buildUrl(`layouts/${layout}/records`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          params: requestParams,
        }
      );

      if (!response.data || !response.data.response) {
        throw new Error("Invalid response from FileMaker server");
      }

      // Handle merge operation if specified in parameters
      if (parameters.merge) {
        return {
          success: true,
          ...Object.assign(parameters, response.data.response),
        };
      }

      return {
        success: true,
        ...response.data.response,
      };
    });
  }

  /**
   * Finds records in FileMaker
   * @param {String} layout - The layout to use when performing the find
   * @param {Object} query - The query to use in the find request
   * @param {Object} [parameters={}] - Optional request parameters
   * @returns {Promise<Object>} The found records
   */
  async find(
    layout: string,
    query: any,
    parameters: FileMakerParameters = {}
  ): Promise<FileMakerResponse> {
    if (!layout) {
      throw new Error("Layout name is required");
    }
    if (!query) {
      throw new Error("Query is required");
    }

    // Convert query to array format and stringify values
    const requestData = {
      query: toStrings(toArray(query)),
      ...sanitizeParameters(parameters, [
        "limit",
        "sort",
        "offset",
        "portal",
        "script",
        "script.param",
        "script.prerequest",
        "script.prerequest.param",
        "script.presort",
        "script.presort.param",
        "layout.response",
        "offset.*",
        "limit.*",
        "request",
      ]),
    };

    return await this.makeAuthenticatedRequest(async (token) => {
      console.log(
        `${this.formatLogTime(new Date())} make request to filemaker `,
        {
          url: this.buildUrl(`layouts/${layout}/_find`),
          requestData,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const response = await this.axiosInstance.post(
        this.buildUrl(`layouts/${layout}/_find`),
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data || !response.data.response) {
        throw new Error("Invalid response from FileMaker server");
      }

      // Handle merge operation if specified in parameters
      if (parameters.merge) {
        return {
          success: true,
          ...Object.assign(query, response.data.response),
        };
      }

      return {
        success: true,
        ...response.data.response,
      };
    });
  }

  /**
   * Sets global field values
   * @param {Object} data - The global field values to set
   * @param {Object} [parameters={}] - Optional request parameters
   * @returns {Promise<Object>} The result of setting globals
   */
  async globals(
    data: any,
    parameters: FileMakerParameters = {}
  ): Promise<FileMakerResponse> {
    if (!data || typeof data !== "object") {
      throw new Error("Valid data object is required");
    }

    // Sanitize parameters for the request
    const sanitizedParams = sanitizeParameters(parameters, [
      "script",
      "script.param",
      "script.prerequest",
      "script.prerequest.param",
      "script.presort",
      "script.presort.param",
      "request",
    ]);

    const requestData = {
      globalFields: data,
      ...sanitizedParams,
    };

    return await this.makeAuthenticatedRequest(async (token) => {
      console.log(
        `${this.formatLogTime(new Date())} make request to filemaker `,
        {
          url: this.buildUrl("globals"),
          requestData,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const response = await this.axiosInstance.patch(
        this.buildUrl("globals"),
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data || !response.data.response) {
        throw new Error("Invalid response from FileMaker server");
      }

      // Handle merge operation if specified in parameters
      if (parameters.merge) {
        return {
          success: true,
          ...Object.assign(data, response.data.response),
        };
      }

      return {
        success: true,
        ...response.data.response,
      };
    });
  }

  /**
   * Uploads a file to a FileMaker record container field
   * @param {String} file - The path to the file to upload or a file object with name and buffer
   * @param {String} layout - The layout to use when performing the upload
   * @param {String} containerFieldName - The field name to insert the data into (must be a container field)
   * @param {Number|String} [recordId=0] - The recordId to use when uploading the file. If 0, creates a new record
   * @param {Object} [parameters={}] - Additional parameters for the upload
   * @param {Number} [parameters.fieldRepetition=1] - The field repetition to use
   * @returns {Promise<Object>} The upload result
   */
  async upload(
    file: string | FileMakerFile,
    layout: string,
    containerFieldName: string,
    recordId = 0,
    parameters: FileMakerParameters = {}
  ): Promise<FileMakerResponse> {
    if (!layout) {
      throw new Error("Layout name is required");
    }
    if (!containerFieldName) {
      throw new Error("Container field name is required");
    }

    let fileBuffer: Buffer;
    let fileName: string;

    if (typeof file === "string") {
      fileBuffer = await fs.promises.readFile(file);
      fileName = path.basename(file);
    } else {
      fileBuffer = file.buffer;
      fileName = file.name;
    }

    const form = new FormData();
    form.append("upload", fileBuffer, { filename: fileName });

    // Add parameters to form
    Object.entries(parameters).forEach(([key, value]) => {
      if (value !== undefined) {
        form.append(key, value);
      }
    });

    return await this.makeAuthenticatedRequest(async (token) => {
      const response = await this.axiosInstance.post(
        this.buildUrl(
          `layouts/${layout}/records/${recordId}/containers/${containerFieldName}/1`
        ),
        form,
        {
          headers: {
            ...form.getHeaders(),
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    });
  }

  /**
   * Runs a script with minimal overhead
   * @param {String} layout - The layout to use
   * @param {Object|Array} scripts - The scripts to run
   * @param {Object} parameters - Parameters to pass to the script
   * @param {Object} request - Additional request parameters
   * @returns {Promise<Object>} The script execution result
   */
  async run(
    layout: string,
    scripts: FileMakerScript | FileMakerScript[],
    parameters: FileMakerParameters,
    request: FileMakerParameters
  ): Promise<FileMakerResponse> {
    if (!layout) {
      throw new Error("Layout name is required");
    }

    const requestParams = {
      ...sanitizeParameters(
        Object.assign(
          Array.isArray(scripts)
            ? { scripts }
            : typeof scripts === "string"
            ? { script: scripts }
            : { scripts: [scripts] },
          typeof scripts === "string" && typeof parameters !== "undefined"
            ? { "script.param": parameters }
            : {},
          namespace({ limit: 1 })
        ),
        [
          "script",
          "script.param",
          "script.prerequest",
          "script.prerequest.param",
          "script.presort",
          "script.presort.param",
          "_limit",
        ]
      ),
    };

    return await this.makeAuthenticatedRequest(async (token) => {
      console.log(
        `${this.formatLogTime(new Date())} make request to filemaker `,
        {
          url: this.buildUrl(`layouts/${layout}/records`),
          parameters: requestParams,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const response = await this.axiosInstance.get(
        this.buildUrl(`layouts/${layout}/records`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          params: requestParams,
        }
      );

      if (!response.data || !response.data.response) {
        throw new Error("Invalid response from FileMaker server");
      }

      return {
        success: true,
        scriptResult: response.data.response.scriptResult,
      };
    });
  }

  /**
   * Runs a script
   * @param {String} layout - The layout to use
   * @param {String} script - The script name to run
   * @param {String|Object} [param] - Optional script parameter
   * @param {Object} [parameters={}] - Optional request parameters
   * @returns {Promise<Object>} The script execution result
   */
  async script(
    layout: string,
    script: string,
    param: FileMakerScript["param"] = {},
    parameters: FileMakerParameters = {}
  ): Promise<FileMakerResponse> {
    if (!layout) {
      throw new Error("Layout name is required");
    }
    if (!script) {
      throw new Error("Script name is required");
    }

    // Sanitize parameters for the request
    const requestParams = {
      script,
      ...sanitizeParameters(parameters, [
        "script",
        "script.param",
        "script.prerequest",
        "script.prerequest.param",
        "script.presort",
        "script.presort.param",
      ]),
    };

    // if (param) {
    //     requestParams['script.param'] = typeof param === 'string' ? param : JSON.stringify(param);
    // }

    return await this.makeAuthenticatedRequest(async (token) => {
      console.log(
        `${this.formatLogTime(new Date())} make request to filemaker `,
        {
          url: this.buildUrl(`layouts/${layout}/script/${script}`),
          parameters: requestParams,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const response = await this.axiosInstance.get(
        this.buildUrl(`layouts/${layout}/script/${script}`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          params: requestParams,
        }
      );

      if (!response.data || !response.data.response) {
        throw new Error("Invalid response from FileMaker server");
      }

      // Handle merge operation if specified in parameters
      if (parameters.merge) {
        return {
          success: true,
          ...Object.assign(param, response.data.response),
        };
      }

      return {
        success: true,
        ...response.data.response,
      };
    });
  }

  /**
   * Runs a script with a record
   * @param {String} layout - The layout to use
   * @param {String} script - The script name to run
   * @param {String} recordId - The record ID to use
   * @param {String|Object} [param] - Optional script parameter
   * @param {Object} [parameters={}] - Optional request parameters
   * @returns {Promise<Object>} The script execution result
   */
  async runScript(
    layout: string,
    script: string,
    recordId: string,
    param: FileMakerScript["param"] = {},
    parameters: FileMakerParameters = {}
  ): Promise<FileMakerResponse> {
    if (!layout) {
      throw new Error("Layout name is required");
    }
    if (!script) {
      throw new Error("Script name is required");
    }
    if (!recordId) {
      throw new Error("Record ID is required");
    }

    // Sanitize parameters for the request
    const requestParams = {
      script,
      ...sanitizeParameters(namespace(parameters), [
        "script",
        "script.param",
        "script.prerequest",
        "script.prerequest.param",
        "script.presort",
        "script.presort.param",
        "layout.response",
        "portal",
        "_offset.*",
        "_limit.*",
        "request",
      ]),
    };

    // if (param) {
    //     requestParams['script.param'] = typeof param === 'string' ? param : JSON.stringify(param);
    // }

    return await this.makeAuthenticatedRequest(async (token) => {
      console.log(
        `${this.formatLogTime(new Date())} make request to filemaker `,
        {
          url: this.buildUrl(`layouts/${layout}/records/${recordId}`),
          parameters: requestParams,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const response = await this.axiosInstance.get(
        this.buildUrl(`layouts/${layout}/records/${recordId}`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          params: requestParams,
        }
      );

      if (!response.data || !response.data.response) {
        throw new Error("Invalid response from FileMaker server");
      }

      // Handle merge operation if specified in parameters
      if (parameters.merge) {
        return {
          success: true,
          ...Object.assign(param, response.data.response),
        };
      }

      return {
        success: true,
        ...response.data.response,
      };
    });
  }

  /**
   * Generates a URL for creating a new record
   * @param {string} layout - The database layout to use
   * @param {string} [version="vLatest"] - The Data API version to use
   * @return {string} A URL to use when creating records
   */
  createUrl(layout: string, version = "vLatest"): string {
    return this.buildUrl(`layouts/${layout}/records`);
  }

  /**
   * Generates a URL for updating a record
   * @param {string} layout - The database layout to use
   * @param {string} recordId - The FileMaker internal record id to update
   * @param {string} [version="vLatest"] - The Data API version to use
   * @return {string} A URL to use when updating records
   */
  updateUrl(layout: string, recordId: string, version = "vLatest"): string {
    return this.buildUrl(`layouts/${layout}/records/${recordId}`);
  }

  /**
   * Generates a URL for deleting a record
   * @param {string} layout - The database layout to use
   * @param {string} recordId - The FileMaker internal record id to delete
   * @param {string} [version="vLatest"] - The Data API version to use
   * @return {string} A URL to use when deleting records
   */
  deleteUrl(layout: string, recordId: string, version = "vLatest"): string {
    return this.buildUrl(`layouts/${layout}/records/${recordId}`);
  }

  /**
   * Generates a URL for getting a record's details
   * @param {string} layout - The database layout to use
   * @param {string} recordId - The FileMaker internal record id to get
   * @param {string} [version="vLatest"] - The Data API version to use
   * @return {string} A URL to use when getting one record
   */
  getUrl(layout: string, recordId: string, version = "vLatest"): string {
    return this.buildUrl(`layouts/${layout}/records/${recordId}`);
  }

  /**
   * Generates a URL for listing records
   * @param {string} layout - The database layout to use
   * @param {string} [version="vLatest"] - The Data API version to use
   * @return {string} A URL to use when listing records
   */
  listUrl(layout: string, version = "vLatest"): string {
    return this.buildUrl(`layouts/${layout}/records`);
  }

  /**
   * Generates a URL for performing a find request
   * @param {string} layout - The database layout to use
   * @param {string} [version="vLatest"] - The Data API version to use
   * @return {string} A URL to use when performing a find
   */
  findUrl(layout: string, version = "vLatest"): string {
    return this.buildUrl(`layouts/${layout}/_find`);
  }

  /**
   * Generates a URL for setting globals
   * @param {string} [version="vLatest"] - The Data API version to use
   * @return {string} A URL to use when setting globals
   */
  globalsUrl(version = "vLatest"): string {
    return this.buildUrl("");
  }

  /**
   * Generates a URL for logging out of a FileMaker Session
   * @param {string} token - The token to logout
   * @param {string} [version="vLatest"] - The Data API version to use
   * @return {string} A URL to use when logging out of a FileMaker DAPI session
   */
  logoutUrl(token: string, version = "vLatest"): string {
    return this.buildUrl(`sessions/${token}`);
  }

  /**
   * Generates a URL for uploading files to FileMaker containers
   * @param {string} layout - The database layout to use
   * @param {string} recordId - The record id to use when inserting the file
   * @param {string} fieldName - The field to use when inserting a file
   * @param {string|number} [fieldRepetition=1] - The field repetition to use when inserting the file
   * @param {string} [version="vLatest"] - The Data API version to use
   * @return {string} A URL to use when uploading files to FileMaker
   */
  uploadUrl(
    layout: string,
    recordId: string,
    fieldName: string,
    fieldRepetition = 1,
    version = "vLatest"
  ): string {
    return this.buildUrl(
      `layouts/${layout}/records/${recordId}/containers/${fieldName}/${fieldRepetition}`
    );
  }

  /**
   * Generates a URL for retrieving authentication tokens
   * @param {string} [version="vLatest"] - The Data API version to use
   * @return {string} A URL to use when authenticating a FileMaker DAPI session
   */
  authenticationUrl(version = "vLatest"): string {
    return this.buildUrl(`sessions`);
  }

  /**
   * Generates a URL for retrieving database layouts
   * @param {string} [version="vLatest"] - The Data API version to use
   * @return {string} A URL for retrieving database layouts
   */
  layoutsUrl(version = "vLatest"): string {
    return this.buildUrl(`layouts`);
  }

  /**
   * Generates a URL for getting specific layout metadata
   * @param {string} layout - The database layout to use
   * @param {string} [version="vLatest"] - The Data API version to use
   * @return {string} A URL for retrieving specific layout metadata
   */
  layoutUrl(layout: string, version = "vLatest"): string {
    return this.buildUrl(`layouts/${layout}`);
  }

  /**
   * Generates a URL for listing database scripts
   * @param {string} [version="vLatest"] - The Data API version to use
   * @return {string} A URL for listing database scripts
   */
  scriptsUrl(version = "vLatest"): string {
    return this.buildUrl(`scripts`);
  }

  /**
   * Generates a URL for duplicating FileMaker records
   * @param {string} layout - The database layout to use
   * @param {string} recordId - The FileMaker internal record id to duplicate
   * @param {string} [version="vLatest"] - The Data API version to use
   * @return {string} A URL to duplicate FileMaker records
   */
  duplicateUrl(layout: string, recordId: string, version = "vLatest"): string {
    return this.buildUrl(`layouts/${layout}/records/${recordId}`);
  }

  /**
   * Generates a URL for retrieving FileMaker Server metadata
   * @param {string} [version="vLatest"] - The Data API version to use
   * @return {string} The URL to use to retrieve FileMaker Server metadata
   */
  productInfoUrl(version = "vLatest"): string {
    return this.buildUrl(`fmi/data/${version}/productInfo`);
  }

  /**
   * Generates a URL for retrieving FileMaker Server hosted databases
   * @param {string} [version="vLatest"] - The Data API version to use
   * @return {string} The URL to use to retrieve FileMaker Server hosted databases
   */
  databasesUrl(version = "vLatest"): string {
    return this.buildUrl(`fmi/data/${version}/databases`);
  }

  /**
   * Generates a URL for running a FileMaker script
   * @param {string} layout - The database layout to use
   * @param {string} script - The name of the script to run
   * @param {string|Object|Number} [parameter] - Optional script parameters to pass to the called script
   * @param {string} [version="vLatest"] - The Data API version to use
   * @return {string} The URL to call a specific FileMaker script
   */
  scriptUrl(
    layout: string,
    script: string,
    parameter: FileMakerScript["param"],
    version = "vLatest"
  ): string {
    return this.buildUrl(`layouts/${layout}/script/${script}`);
  }

  /**
   * Generates a URL for running a script with record id and params as queryString
   * @param {string} layout - The database layout to use
   * @param {string} script - The name of the script to run
   * @param {string} recordId - The record ID to use
   * @param {string} param - The script parameter
   * @param {string} [version="vLatest"] - The Data API version to use
   * @return {string} The URL to run a script with parameters
   */
  runScriptUrl(
    layout: string,
    script: string,
    recordId: string,
    param: FileMakerScript["param"],
    version = "vLatest"
  ): string {
    return this.buildUrl(
      `layouts/${layout}/records/${recordId}?script=${script}&script.param=${param}`
    );
  }

  /**
   * Creates a session with the Data API and returns a token
   * @returns {Promise<Object>} The authentication response
   */
  async login(): Promise<FileMakerResponse> {
    return await this.makeAuthenticatedRequest(async (token) => {
      console.log(
        `${this.formatLogTime(new Date())} make request to filemaker `,
        {
          url: this.buildUrl("sessions"),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const response = await this.axiosInstance.post(
        this.buildUrl("sessions"),
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data || !response.data.response) {
        throw new Error("Invalid response from FileMaker server");
      }

      return {
        success: true,
        ...response.data.response,
      };
    });
  }

  /**
   * Logs out of the current authentication session
   * @param {String} [id] - The connection id to logout
   * @returns {Promise<Object>} The logout response
   */
  async logout(id: string): Promise<FileMakerResponse> {
    return await this.makeAuthenticatedRequest(async (token) => {
      console.log(
        `${this.formatLogTime(new Date())} make request to filemaker `,
        {
          url: this.buildUrl(`sessions/${id || token}`),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const response = await this.axiosInstance.delete(
        this.buildUrl(`sessions/${id || token}`),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data || !response.data.response) {
        throw new Error("Invalid response from FileMaker server");
      }

      return {
        success: true,
        ...response.data.response,
      };
    });
  }

  /**
   * Retrieves information about the FileMaker Server or FileMaker Cloud host
   * @returns {Promise<Object>} The product information
   */
  async productInfo(): Promise<FileMakerResponse> {
    return await this.makeAuthenticatedRequest(async (token) => {
      console.log(
        `${this.formatLogTime(new Date())} make request to filemaker `,
        {
          url: this.buildUrl("productInfo"),
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const response = await this.axiosInstance.get(
        this.buildUrl("productInfo"),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data || !response.data.response) {
        throw new Error("Invalid response from FileMaker server");
      }

      return {
        success: true,
        ...response.data.response,
      };
    });
  }

  /**
   * Compiles Data API Client status information
   * @returns {Promise<Object>} The status information
   */
  async status(): Promise<FileMakerResponse> {
    return await this.makeAuthenticatedRequest(async (token) => {
      console.log(
        `${this.formatLogTime(new Date())} make request to filemaker `,
        {
          url: this.buildUrl("status"),
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const response = await this.axiosInstance.get(this.buildUrl("status"), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.data || !response.data.response) {
        throw new Error("Invalid response from FileMaker server");
      }

      return {
        success: true,
        ...response.data.response,
      };
    });
  }

  /**
   * Resets the client, clearing pending and queued requests and DAPI sessions
   * @returns {Promise<Object>} The reset response
   */
  async reset(): Promise<FileMakerResponse> {
    return await this.makeAuthenticatedRequest(async (token) => {
      console.log(
        `${this.formatLogTime(new Date())} make request to filemaker `,
        {
          url: this.buildUrl("reset"),
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const response = await this.axiosInstance.post(
        this.buildUrl("reset"),
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data || !response.data.response) {
        throw new Error("Invalid response from FileMaker server");
      }

      return {
        success: true,
        ...response.data.response,
      };
    });
  }

  /**
   * Retrieves information about the FileMaker Server's hosted databases
   * @param {Object} [credentials] - Credentials to use when listing server databases
   * @param {String} [version] - The API version to use
   * @returns {Promise<Object>} The databases information
   */
  async databases(
    credentials: any,
    version: string
  ): Promise<FileMakerResponse> {
    return await this.makeAuthenticatedRequest(async (token) => {
      console.log(
        `${this.formatLogTime(new Date())} make request to filemaker `,
        {
          url: this.buildUrl("databases"),
          parameters: {
            ...credentials,
            version,
          },
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const response = await this.axiosInstance.get(
        this.buildUrl("databases"),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          params: {
            ...credentials,
            version,
          },
        }
      );

      if (!response.data || !response.data.response) {
        throw new Error("Invalid response from FileMaker server");
      }

      return {
        success: true,
        ...response.data.response,
      };
    });
  }

  /**
   * Retrieves information about the FileMaker Server's hosted databases
   * @param {Object} [parameters={}] - Optional request parameters
   * @returns {Promise<Object>} The layouts information
   */
  async layouts(
    parameters: FileMakerParameters = {}
  ): Promise<FileMakerResponse> {
    return await this.makeAuthenticatedRequest(async (token) => {
      console.log(
        `${this.formatLogTime(new Date())} make request to filemaker `,
        {
          url: this.buildUrl("layouts"),
          parameters: sanitizeParameters(parameters, [
            "script",
            "script.param",
            "script.prerequest",
            "script.prerequest.param",
            "script.presort",
            "script.presort.param",
            "request",
          ]),
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const response = await this.axiosInstance.get(this.buildUrl("layouts"), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        params: sanitizeParameters(parameters, [
          "script",
          "script.param",
          "script.prerequest",
          "script.prerequest.param",
          "script.presort",
          "script.presort.param",
          "request",
        ]),
      });

      if (!response.data || !response.data.response) {
        throw new Error("Invalid response from FileMaker server");
      }

      return {
        success: true,
        ...response.data.response,
      };
    });
  }

  /**
   * Retrieves information about the FileMaker Server's hosted databases
   * @param {Object} [parameters={}] - Optional request parameters
   * @returns {Promise<Object>} The scripts information
   */
  async scripts(
    parameters: FileMakerParameters = {}
  ): Promise<FileMakerResponse> {
    return await this.makeAuthenticatedRequest(async (token) => {
      console.log(
        `${this.formatLogTime(new Date())} make request to filemaker `,
        {
          url: this.buildUrl("scripts"),
          parameters: sanitizeParameters(parameters, [
            "script",
            "script.param",
            "script.prerequest",
            "script.prerequest.param",
            "script.presort",
            "script.presort.param",
            "request",
          ]),
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const response = await this.axiosInstance.get(this.buildUrl("scripts"), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        params: sanitizeParameters(parameters, [
          "script",
          "script.param",
          "script.prerequest",
          "script.prerequest.param",
          "script.presort",
          "script.presort.param",
          "request",
        ]),
      });

      if (!response.data || !response.data.response) {
        throw new Error("Invalid response from FileMaker server");
      }

      return {
        success: true,
        ...response.data.response,
      };
    });
  }
}

// Export a singleton instance of FileMakerService
export default FileMakerService;
