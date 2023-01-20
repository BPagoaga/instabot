import axios from "axios";

export const getIgResponse = async (userId, sessionId, nextPage, searchSurface, endpoint) => {
    const BASE_URL = "https://www.instagram.com/api/v1/friendships/2944763552/";
    const headers = {
        'Cookie': `ds_user_id=${userId};sessionid=${sessionId};`,
        'User-Agent':'Mozilla/5.0 (Linux; Android 8.1.0; motorola one Build/OPKS28.63-18-3; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/70.0.3538.80 Mobile Safari/537.36 Instagram 72.0.0.21.98 Android (27/8.1.0; 320dpi; 720x1362; motorola; motorola one; deen_sprout; qcom; pt_BR; 132081645)'
    };
    const queryParams = new URLSearchParams();
    queryParams.set("count", 200);

    if (nextPage) {
        queryParams.set("max_id", nextPage);
    }
    // queryParams.set("search_surface", searchSurface)

    return (await axios.get(`${BASE_URL}${endpoint}?${queryParams.toString()}`, {
        headers,
    })).data;
}