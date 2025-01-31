import {
  Text,
  StyleSheet,
  Modal,
  View,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const ModalAlert = (props) => {
  /*
<ModalAlert
header={'My Header'}
body={'My body'}
showAction={false}
negative={youraction}
action={'Action Button'}
actionID={'1'}
close={'Close Button'}
/>
*/
  const [modalUpload, setModalUpload] = useState(false);

  return (
    <SafeAreaView style={style.container}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={true}
        onRequestClose={() => {
          setModalUpload(!modalUpload);
        }}
      >
        <View style={style.centeredView}>
          <View style={style.modalView}>
            <View
              style={{
                flexDirection: "column",
                marginTop: -20,
                marginBottom: 25,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 30,
                  alignContent: "space-between",
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 20,
                    fontWeight: 500,
                  }}
                >
                  {props.header}
                </Text>
              </View>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 30,
                alignContent: "space-between",
              }}
            >
              <View style={{ flexDirection: "column" }}>
                <Text
                  style={{
                    textAlign: "center",
                    marginTop: 10,
                  }}
                >
                  {props.body}
                </Text>
              </View>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 30,
              alignContent: "space-between",
            }}
          >
            {props.showAction && (
              <TouchableOpacity
                style={{
                  marginTop: 20,
                  width: "70%",
                  backgroundColor: "#dc3545",
                  borderRadius: 24,
                  padding: 15,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                }}
                onPress={() => {
                  props.negative(props.actionID);
                }}
              >
                <Text
                  style={{
                    textTransform: "uppercase",
                    fontSize: 20,
                    fontWeight: 600,
                    color: "#fff",
                  }}
                >
                  {props.action}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={{
                marginTop: 20,
                width: "50%",
                backgroundColor: "#adb5bd",
                borderRadius: 24,
                padding: 15,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
              onPress={() => {
                setModalUpload(false);
              }}
            >
              <Text
                style={{
                  textTransform: "uppercase",
                  fontSize: 20,
                  fontWeight: 600,
                  color: "#fff",
                }}
              >
                {props.close}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const style = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#ecf0f1",
    padding: 8,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 7,
  },
});

export default ModalAlert;
