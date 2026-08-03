import axios from "axios";
import "dotenv/config";
import userAgents from "./user-agents.json" with { type: "json" };

const { userId, sessionId, csrftoken, XASBDID, XIGAppID, XIGWWWClaim } =
  process.env;

export const getIgResponse = async (nextPage, searchSurface, endpoint) => {
  const BASE_URL = `https://www.instagram.com/api/v1/friendships/${userId}/`;
  let i = 0;

  let result = false;
  while (result === false && i < userAgents.length) {
    let userAgent = userAgents[i];
    const headers = {
      Cookie: 'csrftoken=IE31NXwxm8oOLqClpuOX1ZSeKxqDX39W; datr=vEhrac0DOQVWJickjtzwY0RS; ig_did=330CBD60-0056-4957-9D40-14E8670DF26A; mid=aWtIvAAEAAGTHzU2nR3PSOH-1fXy; rur="CLN,2944763552,1800175127:01febbebd8220213e85753e9d5ee09bbbd3843b8344f406c7385a8a43666edc6f9afbaa2"; ds_user_id=2944763552; sessionid=2944763552%3A1nNXQkm8dBPfnB%3A20%3AAYgOjtMK2EVYwUgHiviZcEK20SuMLxrfcRQMzC3_jw; wd=991x899',
      // Cookie: `ds_user_id=${userId};sessionid=${sessionId};csrftoken=${csrftoken};wd=991x899;datr=vEhrac0DOQVWJickjtzwY0RS; ig_did=330CBD60-0056-4957-9D40-14E8670DF26A; mid=aWtIvAAEAAGTHzU2nR3PSOH-1fXy;rur="CLN\x2c2944763552\x2c1800175127:01febbebd8220213e85753e9d5ee09bbbd3843b8344f406c7385a8a43666edc6f9afbaa2";`,
      "User-Agent": userAgent,
      "Accept": "*/*",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-origin",
      Origin: "https://www.instagram.com",
      Referer: "https://www.instagram.com/",
      "X-CSRFToken": csrftoken,
      "X-ASBD-ID": XASBDID,
      "X-IG-App-ID": XIGAppID,
      "X-IG-WWW-Claim": XIGWWWClaim,
      "X-Requested-With": "XMLHttpRequest",
    };
    const queryParams = new URLSearchParams();
    queryParams.set("count", 200);

    if (nextPage) {
      queryParams.set("max_id", nextPage);
    }

    queryParams.set("search_surface", searchSurface);
    result = await tryRequest(BASE_URL, endpoint, headers, queryParams);
    i++;
  }

  return result;
};

const tryRequest = async (url, endpoint, headers, queryParams) => {
  try {
    return (
      await axios.get(`${url}${endpoint}?${queryParams.toString()}`, {
        headers,
      })
    ).data;
  } catch (error) {
    console.error("Error fetching Instagram data:", error.response?.data || error.message);
    return false;
  }
}
