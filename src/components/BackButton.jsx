// client/src/components/BackButton.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native-web";
import { IoArrowBack } from "react-icons/io5";

const BackButton = ({ label = "Назад", to = -1 }) => {
  const navigate = useNavigate();

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => navigate(to)}
    >
      <View style={styles.content}>
        <IoArrowBack size={20} color="#fff" />
        <Text style={styles.text}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#2637A1",
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 8,
    fontWeight: "500",
  },
});

export default BackButton;
