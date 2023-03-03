import {
    Configuration, ConfigurationParameters, CreateChatCompletionResponse, OpenAIApi
} from "openai";
import { AxiosRequestConfig, AxiosResponseHeaders } from "axios";

export interface AxiosResponse<T = any, D = any> {
    data: T;
    status: number;
    statusText: string;
    headers: AxiosResponseHeaders;
    config: AxiosRequestConfig<D>;
    request?: any;
}

class ApiError extends Error {
    private readonly response: AxiosResponse;

    constructor(response: AxiosResponse, msg?: string) {
        super(msg);
        this.response = response;
    }

    public get from() {
        return this.response;
    }
}

const createConfig = (configs: ConfigurationParameters) => new Configuration(configs);

const createClient = (config: Configuration) => new OpenAIApi(config);

const requestChat = async (client: OpenAIApi, message: string, user: string) => {
    console.log("Send Request to API.");
    console.log(`Username: ${user}`);
    console.log("Content:");
    console.log(message);

    const response = await client.createChatCompletion({
        model: "gpt-3.5-turbo",
        user,
        max_tokens: 1024,
        messages: [
            {
                role: "user",
                content: message
            }
        ]
    });

    if (response.status != 200) {
        throw new ApiError(response, `HTTP Response Code: ${response.status}`);
    }

    console.log("Response Fetched.");

    return response.data as CreateChatCompletionResponse;
};

export {
    createClient, createConfig, requestChat, ApiError
};
