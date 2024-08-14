import axios from "axios";
import "dotenv/config";

const { userId, sessionId, crsftoken, XASBDID, XIGAppID, XIGWWWClaim } =
  process.env;

export const getIgResponse = async (nextPage, searchSurface, endpoint) => {
  const BASE_URL = `https://www.instagram.com/api/v1/friendships/${userId}/`;
  const headers = {
    Cookie: `ds_user_id=${userId};sessionid=${sessionId};csrftoken=${crsftoken};`,
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:129.0) Gecko/20100101 Firefox/129.0",
    Origin: "https://www.instagram.com",
    Referer: "https://www.instagram.com/",
    "X-CSRFToken": crsftoken,
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

  return (
    await axios.get(`${BASE_URL}${endpoint}?${queryParams.toString()}`, {
      headers,
    })
  ).data;
};
