export type ResponseStatus = 'success' | 'failed';

export interface ErrorDetail {
    field?: string;
    message: string;
}

export interface ApiResponse<T = any> {
    status: ResponseStatus;
    code: number;
    data: T | null;
    message: string;
    error?: string | ErrorDetail[];
}

export class ResponseUtil {
    static success<T>(data: T, message: string = 'Operation successful', code: number = 200): ApiResponse<T> {
        return {
            status: 'success',
            code,
            data,
            message
        };
    }

    static error(message: string, code: number = 400, error?: string | ErrorDetail[]): ApiResponse {
        return {
            status: 'failed',
            code,
            data: null,
            message,
            error
        };
    }

    static validationError(errors: ErrorDetail[]): ApiResponse {
        return {
            status: 'failed',
            code: 400,
            data: null,
            message: 'Validation failed',
            error: errors
        };
    }

    static notFound(message: string = 'Resource not found'): ApiResponse {
        return {
            status: 'failed',
            code: 404,
            data: null,
            message
        };
    }

    static serverError(message: string = 'Internal server error'): ApiResponse {
        return {
            status: 'failed',
            code: 500,
            data: null,
            message
        };
    }
} 