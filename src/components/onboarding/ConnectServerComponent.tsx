import { TextInput, View } from "react-native";
import { ThemedText } from "../ThemedText";
import ThemedButton from "../ThemedButton";
import ThemedInput from "../ThemedInput";

export default function ConnectServerComponent() {
  return <View style={{ alignItems: 'center', gap: 15 }}>
    <ThemedText style={{ textAlign: 'center' }}>Sync server configuration</ThemedText>
    <View style={{ gap: 5 }}>
      <ThemedText>Server URL</ThemedText>
      <ThemedInput placeholder="http://localhost:3000/" />
    </View>
    <View style={{ gap: 5 }}>
      <ThemedText>User Token</ThemedText>
      <ThemedInput secureTextEntry={true} />
    </View>
    <ThemedButton title='Connect' style={{ backgroundColor: '#50328dff' }} rippleColor='#411e86ff' />
  </View>
}