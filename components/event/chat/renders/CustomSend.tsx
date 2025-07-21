// // components/event/chat/renders/CustomSend.tsx
// import React from "react";
// import { TouchableOpacity, StyleSheet } from "react-native";
// import { Send, SendProps } from "react-native-gifted-chat";
// import { Ionicons } from "@expo/vector-icons";

// export const CustomSend = (props: SendProps<any>) => {
//   return (
//     <Send {...props} containerStyle={styles.sendContainer}>
//       <TouchableOpacity
//         style={[
//           styles.sendButton,
//           !props.text || !props.text.trim() ? styles.disabledButton : {},
//         ]}
//         onPress={() => {
//           console.log("send button pressed");
//           console.log("props.text", props.text);
//           console.log("props.onSend", props.onSend);
//           console.log("props.text.trim()", props.text?.trim());
//           console.log(
//             "props.onSend && props.text && props.text.trim()",
//             props.onSend && props.text && props.text.trim()
//           );
//           if (props.onSend && props.text && props.text.trim()) {
//             props.onSend({ text: props.text.trim() }, true);
//           }
//         }}
//         disabled={!props.text || !props.text.trim()}

//       >
//         <Ionicons name="arrow-up" size={20} color="#fff" />
//       </TouchableOpacity>
//     </Send>
//   );
// };

// const styles = StyleSheet.create({
//   sendContainer: {
//     justifyContent: "center",
//     alignItems: "center",
//     paddingRight: 8,
//     paddingLeft: 8,
//   },
//   sendButton: {
//     backgroundColor: "#007AFF",
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   disabledButton: {
//     backgroundColor: "#8e8e93",
//   },
// });

// // components/event/chat/renders/CustomSend.tsx
// import React from "react";
// import { TouchableOpacity, StyleSheet } from "react-native";
// import { SendProps } from "react-native-gifted-chat";
// import { Ionicons } from "@expo/vector-icons";

// export const CustomSend = (props: SendProps<any>) => {
//   const isDisabled = !props.text || !props.text.trim();

//   return (
//     <TouchableOpacity
//       style={[
//         styles.sendContainer,
//         styles.sendButton,
//         isDisabled ? styles.disabledButton : styles.enabledButton,
//       ]}
//       onPress={() => {
//         if (props.onSend && props.text && props.text.trim()) {
//           props.onSend({ text: props.text.trim() }, true);
//         }
//       }}
//       disabled={isDisabled}
//       activeOpacity={isDisabled ? 1 : 0.7}
//     >
//       <Ionicons
//         name="arrow-up"
//         size={20}
//         color={isDisabled ? "#8e8e93" : "#fff"}
//       />
//     </TouchableOpacity>
//   );
// };

// const styles = StyleSheet.create({
//   sendContainer: {
//     justifyContent: "center",
//     alignItems: "center",
//     paddingRight: 8,
//     paddingLeft: 8,
//   },
//   sendButton: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#8e8e93",
//   },
//   enabledButton: {
//     backgroundColor: "#007AFF",
//   },
//   disabledButton: {
//     backgroundColor: "#1c1c1e",
//   },
// });

// components/event/chat/renders/CustomSend.tsx
import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { SendProps } from "react-native-gifted-chat";
import { Ionicons } from "@expo/vector-icons";

export const CustomSend = (props: SendProps<any>) => {
  const isDisabled = !props.text || !props.text.trim();

  return (
    <TouchableOpacity
      style={[
        styles.sendContainer,
        styles.sendButton,
        isDisabled ? styles.disabledButton : styles.enabledButton,
      ]}
      onPress={() => {
        if (props.onSend && props.text && props.text.trim()) {
          props.onSend({ text: props.text.trim() }, true);
        }
      }}
      disabled={isDisabled}
      activeOpacity={isDisabled ? 1 : 0.7}
    >
      <Ionicons
        name="arrow-up"
        size={20}
        color={isDisabled ? "#8e8e93" : "#fff"}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  sendContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    marginLeft: 8,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  enabledButton: {
    backgroundColor: "#007AFF",
  },
  disabledButton: {
    backgroundColor: "#1c1c1e",
    borderWidth: 1,
    borderColor: "#8e8e93",
  },
});
