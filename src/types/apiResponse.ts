import { IMessage } from "@/models/user.model";

export interface ApiResponse {
    success: boolean;
    message: string;
    isAcceptigMessages?: boolean;
    messages?: Array<IMessage>;
}
