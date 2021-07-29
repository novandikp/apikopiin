const { default: axios } = require("axios")

require("dotenv").config()

const { ONESIGNAL_API_KEY_BASE64, ONESIGNAL_APPID } = process.env
// console.log({ONESIGNAL_API_KEY, ONESIGNAL_APPID})
const BASE_ONESIGNAL = "https://onesignal.com/api/v1"

let sendNotification = ({ heading, content, player_ids, additionalData }) => {
  return new Promise((resolve, reject) => {
    try {
      let dataNotif = {
        app_id: ONESIGNAL_APPID,
        include_player_ids: player_ids,
        // 'included_segments' : {'All'},
        data: additionalData,
        headings: { en: heading },
        contents: {
          en: content,
        },
        small_icon: "https://apikopi.herokuapp.com/image/app/logoapp.png",
        large_icon: "https://apikopi.herokuapp.com/image/app/logoapp.png",
      }
      // console.log(dataNotif)
      let { data } = axios.post(`${BASE_ONESIGNAL}/notifications`, dataNotif, {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Basic ${ONESIGNAL_API_KEY_BASE64}`,
        },
      })
      resolve(data)
    } catch (e) {
      reject(e)
    }
  })
}

module.exports = {
  sendNotification,
}
