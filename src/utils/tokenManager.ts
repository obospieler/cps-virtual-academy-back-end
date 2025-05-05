import axios, { AxiosInstance, AxiosError } from 'axios';
import https from 'https';
import moment from 'moment-timezone';

class TokenManager {
    private token: string | null = null;
    private lastUsed: Date | null = null;
    private readonly tokenValidityMinutes = 12; // Token validity in minutes
    private readonly timezone = 'America/Chicago';
    private readonly maxRetries = 1;
    private readonly axiosInstance: AxiosInstance;

    constructor() {
        this.axiosInstance = axios.create({
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            }),
            timeout: 600000 // 10 minutes
        });
    }

    private formatLogTime(date: Date): string {
        return moment(date).tz(this.timezone).format('YYYY-MM-DD HH:mm:ss');
    }

    private getExpirationTime(fromTime: Date): moment.Moment {
        return moment(fromTime).tz(this.timezone).add(this.tokenValidityMinutes, 'minutes');
    }

    private logTokenStatus(action: string, token: string): void {
        const now = new Date();
        const expirationTime = this.getExpirationTime(now);
        const maskedToken = token.substring(0, 10) + '...' + token.substring(token.length - 5);

        const message = `${this.formatLogTime(now)} ${action} token ${maskedToken} which expires (${this.formatLogTime(expirationTime.toDate())})`;
        console.log(message);
    }

    private isTokenValid(): boolean {
        if (!this.token || !this.lastUsed) return false;
        const now = new Date();
        const tokenAge = (now.getTime() - this.lastUsed.getTime()) / 1000 / 60;
        return tokenAge < this.tokenValidityMinutes;
    }

    private updateTokenTimestamp(): void {
        this.lastUsed = new Date();
    }

    private async authenticateAndGetToken(): Promise<string> {
        let retries = 0;

        while (retries < this.maxRetries) {
            try {
                const fmUser = process.env.FILEMAKER_USERNAME;
                const fmPassword = process.env.FILEMAKER_PASSWORD;
                const fmServer = process.env.FILEMAKER_SERVER;
                const fmDatabase = process.env.FILEMAKER_DATABASE;

                if (!fmUser || !fmPassword || !fmServer || !fmDatabase) {
                    throw new Error('Missing required FileMaker environment variables.');
                }

                const authString = Buffer.from(`${fmUser}:${fmPassword}`).toString('base64');
                const response = await this.axiosInstance.post(
                    `https://${fmServer}/fmi/data/v2/databases/${fmDatabase}/sessions`,
                    {},
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Basic ${authString}`
                        }
                    }
                );

                const token = response.data?.response?.token;
                if (token) {
                    this.token = token;
                    this.updateTokenTimestamp();
                    this.logTokenStatus('Got new', token);
                    return token;
                }

                throw new Error('Token not present in FileMaker response.');
            } catch (error) {
                retries++;
                const err = error as AxiosError;

                console.error(`${this.formatLogTime(new Date())} Authentication failed (attempt ${retries}/${this.maxRetries}):
    Error: ${err.message}
    Status: ${err.response?.status}
    URL: ${err.config?.url}
    Method: ${err.config?.method}
    Request Data: ${err.config?.data || 'No request data'}
    Response Data: ${JSON.stringify(err.response?.data, null, 2)}
    Stack: ${err.stack}`);

                if (retries === this.maxRetries) {
                    throw new Error(`Failed to authenticate after ${this.maxRetries} attempts: ${err.message}`);
                }

                await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
            }
        }

        throw new Error('Unreachable code in authenticateAndGetToken');
    }

    public async getValidToken(): Promise<string> {
        if (this.isTokenValid() && this.token) {
            this.logTokenStatus('Reused', this.token);
            this.updateTokenTimestamp();
            return this.token;
        }

        console.log(`${this.formatLogTime(new Date())} Previous token expired or not found, getting new token...`);
        return await this.authenticateAndGetToken();
    }

    public async makeAuthenticatedRequest<T>(requestFn: (token: string) => Promise<T>): Promise<T> {
        let retries = 0;

        while (retries < this.maxRetries) {
            try {
                const token = await this.getValidToken();
                return await requestFn(token);
            } catch (error) {
                retries++;
                const err = error as AxiosError;

                if (err.response?.status === 401) {
                    this.token = null;
                    const newToken = await this.authenticateAndGetToken();
                    return await requestFn(newToken);
                }

                if (retries === this.maxRetries) {
                    console.error(`${this.formatLogTime(new Date())} Request failed after ${this.maxRetries} attempts:
    Error: ${err.message}
    Status: ${err.response?.status}
    URL: ${err.config?.url}
    Method: ${err.config?.method}
    Request Data: ${err.config?.data || 'No request data'}
    Response Data: ${JSON.stringify(err.response?.data, null, 2)}
    Stack: ${err.stack}`);
                    throw new Error(`Request failed after ${this.maxRetries} attempts: ${err.message}`);
                }

                await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
            }
        }

        throw new Error('Unreachable code in makeAuthenticatedRequest');
    }
}

export default TokenManager;
