class ApiResponse<T> {
    statusCode: number;
    data?: T;
    message: string;
    status: boolean;

    constructor(statusCode: number, message: string = "Success", data?: T) {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.status = statusCode < 400;
    }
}

export { ApiResponse };
