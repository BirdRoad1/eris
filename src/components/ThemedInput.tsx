import { TextInput, TextInputProps } from "react-native";

export default function ThemedInput(props: TextInputProps) {
	return <TextInput style={{
		backgroundColor: '#121212ff',
		width: 200,
		borderRadius: 6,
		paddingLeft: 10,
		color: 'white'
	}} placeholderTextColor={'#4e4e4eff'}  {...props} />
} 