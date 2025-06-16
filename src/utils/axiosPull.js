import axios from "axios";
import { constants } from "./constants";
import moment from "moment";
import { storage } from "../context/components/Storage";

const instance = axios.create({
  baseURL: constants.url,
  headers: {
    "Content-Type": "application/json;charset=utf-8",
    Authorization: `Bearer ${moment().unix()}`,
  },
});

export const AITexttoImage = async (prompt) => {
  const options = {
    method: "POST",
    url: "https://api.cloudflare.com/client/v4/accounts/b12ac09dbdadb4c2ff669e43992074ed/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer JlAgzE9tHfASmUs-2XkTs4rkPd8pIe2w5fULSy6R",
    },
    data: {
      num_steps: 20,
      prompt:
        "A realistic representation, create a spectacular image about " +
        prompt,
    },
  };
  await axios
    .request(options)
    .then(function (response) {
      return response.data[0];
    })
    .catch(function (error) {
      console.log("Error: " + error);
    });
};

export const postData = async (endpoint, datas) => {
  const response = await instance.post(endpoint, datas);
  return response.data;
};

export const _getProStatus = async (id, os) => {
  const data = {
    user: id,
  };
  if (os == "ios") {
    const response = await postData("/getPro.php", data);
    return response[0].code;
  } else {
    const response = await postData("/getProv2.php", data);
    return response[0].code;
  }
};

export const _pullCameraFeed = async (owner_ID, type) => {
  const data = {
    owner: owner_ID,
    user: owner_ID,
    type: type,
  };
  const response = await postData("/camera/index.php", data);
  const myData = []
    .concat(response)
    .sort((a, b) => String(a.end).localeCompare(String(b.end)));
  storage.set("user.Camera.Feed", JSON.stringify(myData));
};

export const _pullUser = async (id, screen) => {
  const data = {
    owner: id,
  };
  const response = await postData("/users/index.php", data);
  storage.set("user.Data", JSON.stringify(response[0]));
};

export const _resetBadge = async (owner, pin) => {
  const data = {
    owner: owner,
    pin: pin,
  };
  const response = await postData("/camera/resetBadge.php", data);
  return JSON.stringify(response);
};
export const _pullGalleryArray = async (pin) => {
  const data = {
    pin: pin,
  };
  const response = await postData("/camera/array.php", data);
  return JSON.stringify(response);
};

export const _pullGalleryFeed = async (pin, user) => {
  const data = {
    pin: pin,
    user: user,
  };
  const response = await postData("/camera/gallery.php", data);
  const myData = []
    .concat(response)
    .sort((a, b) => (a.image_id > b.image_id ? -1 : 1));
  storage.set(`user.Gallery.Friend.Feed.${pin}`, JSON.stringify(myData));
};

export const _pullFriendCameraFeed = async (owner_ID, type, myID) => {
  const data = {
    owner: owner_ID,
    user: myID,
    type: type,
  };

  const response = await postData("/camera/index.php", data);
  const myData = []
    .concat(response)
    .sort((a, b) => String(a.end).localeCompare(String(b.end)));
  storage.set(`user.Camera.Friend.Feed.${owner_ID}`, JSON.stringify(myData));
};

export const _pullBlockedFriendsFeedABC = async (id) => {
  const data = {
    owner: id,
  };
  const response = await postData("/users/blocked.php", data);
  const myData = []
    .concat(response)
    .sort((a, b) => a.friend_handle - b.friend_handle);

  storage.set("user.Friend.Blocked", JSON.stringify(myData));
};

export const _pullFriendsAllFeedABC = async (id) => {
  const data = {
    owner: id,
  };
  const response = await postData("/users/friendsAll.php", data);
  const myData = []
    .concat(response)
    .sort((a, b) => a.friend_handle - b.friend_handle);

  storage.set("user.All.Global.Friend.Feed", JSON.stringify(myData));
};

export const _pullFriendsFeedABC = async (id) => {
  const data = {
    owner: id,
  };
  const response = await postData("/users/friends.php", data);
  const myData = []
    .concat(response)
    .sort((a, b) => a.friend_handle - b.friend_handle);

  storage.set("user.AllFriend.Feed", JSON.stringify(myData));
};

export const _pullFriendsFeed = async (id) => {
  const data = {
    owner: id,
  };
  const response = await postData("/users/friends.php", data);
  const myData = []
    .concat(response)
    .sort((a, b) => a.friend_post_date - b.friend_post_date);
  storage.set("user.Friend.Feed", JSON.stringify(myData));
};

export const _pullFriendFeed = async (id) => {
  const data = {
    owner: id,
  };
  const response = await postData("/users/friend.php", data);
  storage.set(`user.Feed.${id}`, JSON.stringify(response[0]));
};

export const _pullHistoryFeed = async (owner) => {
  const data = {
    owner: owner,
  };
  const response = await postData("/camera/closed.php", data);
  const myData = [].concat(response).sort((a, b) => (a.end > b.end ? -1 : 1));
  storage.set("user.Media.Feed", JSON.stringify(myData));
};

export const _pullMembersFeed = async (pin, owner, UUID) => {
  const data = {
    owner: owner,
    pin: pin,
    UUID: UUID,
  };
  const response = await postData("/camera/members.php", data);
  const myData = []
    .concat(response)
    .sort((a, b) => a.user_handle - b.user_handle);
  storage.set(`user.Member.Join.Feed.${pin}`, JSON.stringify(myData));
};

export const axiosPull = {
  AITexttoImage,
  postData,
  _resetBadge,
  _pullHistoryFeed,
  _pullUser,
  _pullCameraFeed,
  _pullFriendCameraFeed,
  _pullGalleryFeed,
  _pullMembersFeed,
  _pullFriendsFeed,
  _getProStatus,
  _pullGalleryArray,
  _pullFriendFeed,
  _pullFriendsFeedABC,
  _pullFriendsAllFeedABC,
  _pullBlockedFriendsFeedABC,
};
