import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View, Image, Platform } from 'react-native';
// import { Layout, Text } from 'react-native-rapi-ui';
import * as tf from '@tensorflow/tfjs';
import {cameraWithTensors, decodeJpeg, bundleResourceIO, fetch} from '@tensorflow/tfjs-react-native'
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions'
import * as coco from '@tensorflow-models/coco-ssd'
import * as jpeg from 'jpeg-js'


import {
	Layout,
	Button,
	Text,
	TopNav,
	Section,
	SectionContent,
	useTheme,
  } from "react-native-rapi-ui";
import { Camera, CameraType } from 'expo-camera';
import { async } from '@firebase/util';

const TensorCamera = cameraWithTensors(Camera)

const modelJSON = require('../modeljs/model.json')
const modelWeights1 = require('../modeljs/group1-shard1of4.bin')
const modelWeights2 = require('../modeljs/group1-shard2of4.bin')
const modelWeights3 = require('../modeljs/group1-shard3of4.bin')
const modelWeights4 = require('../modeljs/group1-shard4of4.bin')
export default function ({ navigation }) {
	

	  
	
	
	
	return (
		<Layout>
			<View
				style={{
					flex: 1,
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<Text>This is the Profile tab</Text>				
				<Text>Profile tab</Text>

			</View>
		</Layout>
	);
}
