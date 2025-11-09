import React from 'react';
import { NowPlayingVariant } from '../../components/Playing';
import { StatusBar } from 'expo-status-bar';

export default function PlayingScreen() {
  return (
    <>
      <StatusBar style="light" />
      <NowPlayingVariant />
    </>
  );
}
