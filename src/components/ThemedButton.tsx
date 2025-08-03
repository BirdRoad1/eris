import { Pressable, PressableProps, StyleSheet, Text } from "react-native";

type Props = {
	title: string;
	onPress?: () => void;
	rippleColor?: string;
} & PressableProps;

export default function ThemedButton({ title, onPress, style, rippleColor, ...props }: Props) {
	return <Pressable
		style={state => [
			typeof style === 'function' ? style(state) : style,
			styles.button,
			// {
			// 	opacity: state.pressed ? 0.5 : 1
			// }
		]}
		android_ripple={{
			color: rippleColor === undefined ? '#2f2f2fff' : rippleColor,
		}}
		// [
		// 	styles.button,
		// 	{
		// 		backgroundColor,//'#50328dff' // 40286f
		// 	}
		// ]}
		onPress={onPress}
		{...props}
	>
		<Text style={styles.buttonText}>{title}</Text>
	</Pressable>
}

const styles = StyleSheet.create({
	button: {
		paddingVertical: 8,
		paddingHorizontal: 30,
		borderRadius: 3
	},
	buttonText: {
		color: 'white'
	}
});