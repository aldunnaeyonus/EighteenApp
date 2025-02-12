import React, { useCallback } from "react";
import { View, Platform } from "react-native";
import styled from "styled-components/native";
import IOSPermissions from "../SubViews/permissions/ios";
import AndroidPermissions from "../SubViews/permissions/android";
import * as i18n from "../../../i18n";

const Begin = (props) => {
  const _login = useCallback(() => {
    props.navigation.navigate("Handle");
  });

  return (
    <View>
      {Platform.OS == "ios" ? <IOSPermissions profile={'new'}/> : <AndroidPermissions profile={'new'} />}
      <Wrapper>
        <Logo source={require("../../../assets/adaptive-icon.png")} />

        <Title>{i18n.t("Join Snap Eighteen")}</Title>
        <ButtonWrapper>
          <StyledButton
            onPress={() => {
              _login();
            }}
          >
            <StyledTitle>{i18n.t("Start Your Journey")}</StyledTitle>
          </StyledButton>
        </ButtonWrapper>
      </Wrapper>
    </View>
  );
};

export const Wrapper = styled.View`
  justify-content: center;
  padding: 10px;
  align-items: center;
  flex-direction: column;
  background-color: #fff;
  height: 100%;
`;
export const Logo = styled.Image`
  max-width: 300px;
  height: 300px;
  margin: 0px 0px 00px;
`;
export const TextDescription = styled.Text`
  letter-spacing: 3px;
  color: #000;
  text-align: center;
  text-transform: uppercase;
`;
export const ButtonWrapper = styled.View`
  justify-content: center;
  flex-direction: column;
  align-items: center;
`;
export const Title = styled.Text`
  color: #000;
  margin: 100px 0px 20px;
  font-size: 30px;
  text-align: center;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 3px;
`;
const StyledButton = styled.TouchableHighlight`
  width: 250px;
  background-color: ${(props) =>
    props.transparent ? "transparent" : "#e35504"};
  padding: 15px;
  border: ${(props) => (props.transparent ? "1px solid #e35504" : 0)};
  justify-content: center;
  margin-bottom: 20px;
  border-radius: 24px;
`;
StyledTitle = styled.Text`
  text-transform: uppercase;
  text-align: center;
  font-weight: bold;
  letter-spacing: 3px;
  color: ${(props) => (props.transparent ? "#000" : "#fff")};
`;

export default Begin;
