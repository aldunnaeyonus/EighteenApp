import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { ActivityIndicator, MD2Colors } from "react-native-paper";
import * as Progress from 'react-native-progress'; // Ensure this is installed: npm install react-native-progress
import { SCREEN_WIDTH } from "../../../utils/constants"; // Assuming this path is correct
import * as i18n from "../../../../i18n"; // Assuming i18n for messages if needed

/**
 * A reusable loading component with an activity indicator and an optional progress bar.
 *
 * @param {object} props - The component props.
 * @param {boolean} props.isVisible - Controls the visibility of the entire loading component.
 * @param {number} [props.progress=0] - The progress value (0 to 1) for the progress bar.
 * @param {string} [props.message="Loading..."] - The message to display next to the spinner.
 */
const Loading = ({ progress, message, flex }) => {

  let progres = Number(progress);
  let messages = message
  let isVisible = flex == "none" ? false : true;

  if (!isVisible) {
    return null; // Don't render anything if not visible
  }

  return (
    <View style={styles.container}>
      {/* Container for ActivityIndicator and Text */}
      <View style={styles.contentRow}>
        <ActivityIndicator
          size={25}
          animating={true}
          color={MD2Colors.grey700}
        />
        <Text style={styles.messageText}>
          {messages}
        </Text>
      </View>

      {/* Progress Bar at the bottom */}
      <Progress.Bar
        progress={Number(progres)} // Ensure progress is a number
        width={SCREEN_WIDTH - 20} // Adjust width based on container padding
        height={5}
        color={MD2Colors.orange500}
        style={styles.progressBar}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // This style dictates the overall appearance and visibility of the loading component.
    // The parent component should handle whether to render this component at all,
    // rather than relying on `display: 'none'` within the component itself.
    // If you need a full-screen overlay, adjust these styles or wrap it in a Modal.
    // Example for a typical loading bar/message:
    width: SCREEN_WIDTH, // Takes full width of the screen
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: 'white', // Or a subtle background
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start', // Align content to the start
    width: '100%', // Take full width of parent container for alignment
    paddingLeft: 10, // Indent content slightly
    marginBottom: 10, // Space between text/spinner and progress bar
  },
  messageText: {
    marginLeft: 15, // Space between spinner and text
    fontWeight: "600",
    fontSize: 15,
    color: '#333', // Darker text for readability
    flexShrink: 1, // Allow text to wrap if too long
  },
  progressBar: {
    // Positioned normally at the bottom of the container
    alignSelf: 'center', // Center the progress bar within its container
  },
});

export default Loading;