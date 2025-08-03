import { StyleSheet, View } from "react-native";
import { ThemedText } from "../ThemedText";

export default function StartComponent() {
  return <View>
    <ThemedText style={styles.tagline}>
      An open-source music player
    </ThemedText>
    <View
      style={{
        width: 256,
        height: 256,
        backgroundColor: 'white',
        borderRadius: '50%',
        marginHorizontal: 'auto',
        marginVertical: 20
      }}
    ></View>
    <ThemedText
      style={{
        marginHorizontal: 25,
        backgroundColor: '#111111',
        padding: 15,
        borderRadius: 10
      }}
    >
      Welcome to Eris, a next-generation music app. If you love freedom and
      local storage, you will hopefully love this app! To begin, we will go
      through some steps to get the app setup and working.
    </ThemedText>
  </View>
}

const styles = StyleSheet.create({
  tagline: {
    textAlign: 'center'
  },
});
