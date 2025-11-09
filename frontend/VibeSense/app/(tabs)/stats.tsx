import React from 'react';
import { StatsPage } from '../../components/Stats';
import { StatusBar } from 'expo-status-bar';

export default function StatsScreen() {
  return (
    <>
      <StatusBar style="light" />
      <StatsPage />
    </>
  );
}
