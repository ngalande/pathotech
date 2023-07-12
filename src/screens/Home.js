import React, { useContext, useEffect, useRef, useState } from "react";
import { View, Linking, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { SimpleLineIcons, Feather, Ionicons  } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import {
  Layout,
  Button,
  Text,
  TopNav,
  Section,
  SectionContent,
  useTheme,
} from "react-native-rapi-ui";
import { Camera, CameraType } from "expo-camera";
import { AuthContext } from "../provider/AuthProvider";
import axios from "axios";

export default function ({ navigation }) {
  const [type, setType] = useState(CameraType.back);
  const [isPreview, setIsPreview] = useState(false);
  const { isDarkmode, setTheme } = useTheme();
  const [camera, setCamera] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [image, setImage] = useState(null);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const cameraRef = useRef();
  const [videoSource, setVideoSource] = useState(null);
  const {setUser, user} = useContext(AuthContext)

  useEffect(() => {
    console.log(user)
    if(!isDarkmode){
      setTheme('dark')
    }
  }, [])
  useEffect(() => {
    // detectImage()
    // onAuthStateChanged(auth, user => {
    //   if(user) {
    //     console.log(user)
    //   }else{
    //     console.log("no user")
    //   }
    // })
  }, [])
  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={{flex: 1, justifyContent:'center', width: '50%', alignSelf:'center'}}>
        <Text style={{ textAlign: 'center', color:'#000' }}>We need your permission to show the camera</Text>
        <Button
              style={{ marginTop: 10, width: '50%' }}
              text="Grant Permission"
              status="info"
              onPress={requestPermission}
            />
        {/* <Button color="#000" onPress={requestPermission} title="grant permission" /> */}
      </View>
    );
    // console.log(permission.status)
  }
  function toggleCameraType() {
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  }
  const auth = getAuth();

  const takePicture = async () => {
    if (cameraRef.current) {
      const options = { quality: 0.5, base64: true, skipProcessing: true };
      const data = await cameraRef.current.takePictureAsync(options);
      const source = data.uri;
      if (source) {
        await cameraRef.current.pausePreview();
        setIsPreview(true);
        console.log("picture source", source);
      }
    }
  };
  const cancelPreview = async () => {
    await cameraRef.current.resumePreview();
    setIsPreview(false);
    setVideoSource(null);
  };
  const handleSignout = () => {
    signOut(auth).then(res => {
      setUser(false)
      console.log('Logged out')
    }).catch(e => {
      console.log(e)
    })
  }

  const detectImage = async(file, type) => {
    setIsLoading(true)
    console.log(type)
    const payload = new FormData()
    payload.append('file', {
        uri: file,
        name: 'plant.jpeg',
        type: 'image/jpeg'
      })
    console.log(payload._parts)
    // axios.post('http://54.215.47.76:3000/predict', payload, {headers: {
    //   'Content-Type': 'multipart/form-data'
    // }})
    //   .then(res => {
    //     console.log(res.data)
    //     setIsLoading(false)
    //   }).catch(e => {
    //     setIsLoading(false)
    //     console.log(e.response.data)
    //   })
      const test = axios.get('http://54.215.47.76:3000/')
        .then(res => {
          console.log(res.data)
        }).catch(e => {
          console.log(e)
        })
      console.log(await test)
  }

  const pickImage = async () => {
		console.log('result');
		// No permissions request is necessary for launching the image library
		let result = await ImagePicker.launchImageLibraryAsync({
		  mediaTypes: ImagePicker.MediaTypeOptions.Images,
		  allowsEditing: true,
		  aspect: [4, 3],
		  quality: 1,
		});
	

		if (!result.canceled) {
      
      const imageURL = result.assets[0].uri
      const slicedURI = imageURL.slice(-6)
      const type = slicedURI.substring(slicedURI.indexOf('.')+1)
			// console.log(type);
      detectImage(imageURL, type)
		  // setImage(imageURL);
		}
	  };

  return (
    <Layout>
      <View
        style={{
          // flex: 1,
          alignItems: "center",
          justifyContent: "center",
          // marginHorizontal: 20,
        }}
      >
        <View style={{ }}>
          <Text style={{alignSelf:'center', marginTop: 50, }} fontWeight='bold' size='h1'>Patho-Tech</Text>
        </View>
        <View style={{flexDirection:'row', marginTop: 50, marginBottom: 50}}>
          <TouchableOpacity onPress={() => handleSignout()} style={{justifyContent:'flex-start', flex:1, marginLeft: 30}}>
            <SimpleLineIcons name="logout" size={24} color={isDarkmode ? "#fff" : '#000'}  />
          </TouchableOpacity>
          {isDarkmode ? (
            <TouchableOpacity onPress={() => {setTheme('light')}}>
            <Feather name='sun' size={24} color='#fff' style={{marginRight: 30}} />
          </TouchableOpacity>
          ):(
            <TouchableOpacity onPress={() => {setTheme('dark')}}>
            <Ionicons name='moon' size={24} color='#000' style={{marginRight: 30}} />
          </TouchableOpacity>
          )}
        </View>
        {camera ? (
          <Section>
          <SectionContent>
            <Camera 
            type={type}
            ref={cameraRef}
            >
              <View style={{flex:0, height:300, width: 300}}>
                <TouchableOpacity onPress={toggleCameraType}>
                  <Text>Flip Camera</Text>
                </TouchableOpacity>
              </View>
            </Camera>
          </SectionContent>
        </Section>
        ):(
          <></>
        )}
        <Section style={{marginTop: 20}}>
          <SectionContent>
            
            {camera ? (
              <>
                <Text fontWeight="bold" style={{ textAlign: "center" }}>
                  Scan Plant
                </Text>
                <Button
                text={isPreview ? "Stop Preview":"Scan"}
                onPress={isPreview ? cancelPreview : takePicture}
                style={{
                  marginTop: 10,
                }}
              /> 
              
              </>
            ):(
              <>
                {isLoading ? (
                  <Text>Loading</Text>

                ):(
                  <></>
                )}
                <Text fontWeight="bold" style={{ textAlign: "center" }}>
                  Open Camera to Capture Plant
                </Text>
              </>
            )}
           
            <Button
              text={camera ? "Close Camera" : "Open Camera"}
              onPress={() => {
                if(camera){
                  setCamera(false)
                }else{
                  setCamera(true)

                }
              }}
              style={{
                marginTop: 10,
              }}
            /> 
            
            {image && <Image source={{uri: image}} style={{flex:1}}/>}
            {camera ? (
              <></>
            ):(
              <>
                <Text fontWeight="bold" style={{ textAlign: "center", marginTop: 20, marginBottom: 5 }}>Or Select Image to scan</Text>
                <Button
                text={"Select Image"}
                onPress={() => {pickImage()}}
                style={{
                  marginTop: 10,
                }}
                /> 
              </>
            )}
          </SectionContent>
        </Section>
        
        
      </View>
    </Layout>
  );
}



const styles = StyleSheet.create({
  container: {
    // flex: 1,
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});
