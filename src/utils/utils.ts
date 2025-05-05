import _ from 'lodash';

type Script = {
    name: string;
    param?: any;
};

type Portal = {
    name: string;
    limit?: number;
    offset?: number;
    [key: string]: any;
};

type InputData = {
    portals?: Portal[];
    scripts?: Script[];
    [key: string]: any;
};

/**
 * Converts portal data to FileMaker format
 * @param data - The data containing portal information
 * @returns Converted portal data
 */
function convertPortals(data: InputData): Record<string, any> {
    const portalArray: string[] = [];
    const { portals } = data;

    const converted = Array.isArray(portals)
        ? _.chain(portals)
            .map(portal =>
                _.mapKeys(portal, (value, key) => {
                    if (key === 'limit') return `limit.${portal.name}`;
                    if (key === 'offset') return `offset.${portal.name}`;
                    if (key === 'name') {
                        portalArray.push(value);
                        return 'remove';
                    }
                    return key;
                })
            )
            .map(portal => _.omitBy(portal, (_, key) => key === 'remove'))
            .value()
        : [];

    return Object.assign({ portals: portalArray }, ...converted);
}

/**
 * Converts script parameters to FileMaker format
 * @param data - The data containing script information
 * @returns Converted script data
 */
function convertScripts(data: InputData): Record<string, any> {
    if (!data.scripts) return {};

    return Array.isArray(data.scripts)
        ? data.scripts.reduce<Record<string, any>>((acc, script) => {
              if (script.name) {
                  acc[`script`] = script.name;
                  if (script.param !== undefined) {
                      acc[`script.param`] =
                          typeof script.param === 'string'
                              ? script.param
                              : JSON.stringify(script.param);
                  }
              }
              return acc;
          }, {})
        : {};
}

/**
 * Converts parameters to FileMaker format
 * @param data - The raw data to convert
 * @returns Converted parameters
 */
function convertParameters(data: InputData): Record<string, any> {
    return Object.assign({}, convertPortals(data), convertScripts(data), data);
}

/**
 * Sanitizes parameters based on allowed keys and converts values to strings
 * @param parameters - Parameters to sanitize
 * @param safeParameters - Array of allowed parameter keys
 * @returns Sanitized parameters
 */
function sanitizeParameters(
    parameters: Record<string, any> = {},
    safeParameters: string[] = []
): Record<string, string> {
    const converted = convertParameters(parameters);

    const filtered = _.pickBy(converted, (_, key) =>
        safeParameters.includes(key) ||
        (safeParameters.includes('_offset.*') && key.startsWith('_offset.')) ||
        (safeParameters.includes('_limit.*') && key.startsWith('_limit.')) ||
        (safeParameters.includes('offset.*') && key.startsWith('offset.')) ||
        (safeParameters.includes('limit.*') && key.startsWith('limit.'))
    );

    return _.mapValues(filtered, value => (typeof value === 'number' ? value.toString() : value));
}

/**
 * The namespace function maps through keys and renames `limit`, `offset`, `sort` to `_limit`, `_offset`, `_sort`.
 * @param data - An object used in a DAPI query
 * @returns A modified object with keys namespaced
 */
function namespace(data: Record<string, any>): Record<string, any> {
    return _.mapKeys(data, (_, key) =>
        ['limit', 'offset', 'sort'].includes(key) ? `_${key}` : key
    );
}

export {
    sanitizeParameters,
    convertPortals,
    convertScripts,
    convertParameters,
    namespace
};
