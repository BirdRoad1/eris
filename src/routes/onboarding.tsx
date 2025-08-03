import { Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import StartComponent from '../components/onboarding/StartComponent';
import { useState } from 'react';
import ConnectServerComponent from '../components/onboarding/ConnectServerComponent';
import ThemedButton from '../components/ThemedButton';

const screens = [StartComponent, ConnectServerComponent];

export default function OnboardingScreen() {
  const [currScreen, setCurrScreen] = useState(0);

  const Screen = screens[currScreen];

  console.log(Screen);

  return (
    <ThemedView style={styles.background}>
      <ThemedText style={styles.title} type="title">
        Eris Setup
      </ThemedText>
      <View style={{
        flex: 1
      }}>
        <Screen />
      </View>
      <View style={styles.buttons}>
        <ThemedButton
          title="Back"
          style={{ backgroundColor: '#121212' }}
          onPress={() => setCurrScreen(curr => Math.max(curr - 1, 0))}
        />
        <ThemedButton
          title="Next"
          style={{ backgroundColor: '#50328dff' }}
          rippleColor='#411e86ff'
          // backgroundColor='#50328dff' // 40286f
          onPress={() => setCurrScreen(curr => Math.min(curr + 1, screens.length - 1))}
        />
      </View>
      <View>{/* TODO: circles here */}</View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  background: {
    paddingTop: StatusBar.currentHeight,
    flex: 1
  },
  title: {
    textAlign: 'center',
    marginVertical: 10
  },
  tagline: {
    textAlign: 'center'
  },
  buttons: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginVertical: 20,
    marginBottom: 150
  },
  button: {
    backgroundColor: '#121212',
    paddingVertical: 8,
    paddingHorizontal: 30,
    borderRadius: 3
  },
  buttonText: {
    color: 'white'
  }
});
