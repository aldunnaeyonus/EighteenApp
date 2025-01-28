import { MMKV } from "react-native-mmkv";

export const storage = new MMKV();

//updateStorage(filteredDataSource, 'credits', credits, `user.Gallery.Friend.Feed.${props.route.params.pin}`);
export const updateStorage = (jsObject, key, value, container) => {
  jsObject[key] = value;
  storage.set(container, JSON.stringify(jsObject));
};

export const updateItemFeed = async (jsObject, pin, credits, container, count) => {
  let newArray = [];
  JSON.parse(jsObject).map((item, index, array)=>{
    if (item.pin == pin) {
      item.credits = credits;
      item.media_count = String(parseInt(item.media_count) + parseInt(count))
    }
    newArray.push(item)
})
  storage.set(container, JSON.stringify(newArray));
};

export const deleteMemberIndex = (data, id, container) => {
  let newArray = [];
  JSON.parse(data).map((item, index) => {
    if (item.user_id == id) {
      item.splice(index, 1);
    }
    newArray.push(item)
  });
  storage.set(container, JSON.stringify(newArray));
};

export const deleteItemIndex = (data, id, container) => {
  let newArray = [];
    JSON.parse(data).map((item, index, array) => {
      if (item.UUID == id) {
        array.splice(index, 1);
      }
      newArray.push(array)
    });
    storage.set(container, JSON.stringify(newArray));
  };

export const storeData = {
  updateStorage,
  updateItemFeed,
  deleteItemIndex
};
