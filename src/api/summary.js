import { baseUrl, postData } from "@/utils/common/serve";

export const getSummaryFromPassData = (data) => {
    return postData({
        url: baseUrl + "/summary",
        data: data,
    });
};
