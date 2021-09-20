import React, { useState, useCallback } from 'react'
import { View, Text, TouchableOpacity, FlatList, ScrollView, StyleSheet, Modal, SafeAreaView, LogBox, TextInput, Dimensions, Platform, RefreshControl, Share } from 'react-native'
import Clipboard from '@react-native-clipboard/clipboard';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Toast from 'react-native-simple-toast';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';
import { data } from '../api/data'

LogBox.ignoreAllLogs();
const wait = (timeout) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
}

const Homescreen = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [nightMode, setNightMode] = useState(false);
    const [selectedItemsCount, setSelectedItemsCount] = useState(0);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [notes, setNotes] = useState(data);
    const [search, setSearch] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [offset, setOffset] = useState(0);
    const [showShortcuts, setShowShortcuts] = useState(true);
    const iconRef = React.useRef(null);
    const cardsRef = React.useRef(null);
    const closeRef = React.useRef(null);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        wait(2000).then(() => setRefreshing(false));
    }, []);

    const showToast = (msg) => {
        Toast.show(msg, Toast.LONG)
    };

    const copyToClipboard = (msg) => {
        Clipboard.setString(msg)
        showToast("Note Copied! to Clipboard")
    }
    const copy = () => {
        copyToClipboard(title + description)
        close()
    }
    const copyOnly = () => {
        copyToClipboard(title + description)
    }

    const theme = ['#ffab9a', '#ffcc80', '#e6ee9b', '#80deea', '#cf93d9', '#80cbc4', '#f48fb1']

    const clearNewNotes = () => {
        setTitle("");
        setDescription("");
        setSelectedItemsCount(0);
        close()
    }
    const onScroll = (event) => {
        var currentOffset = event.nativeEvent.contentOffset.y;
        var direction = currentOffset > offset ? 'down' : 'up';
        setOffset(currentOffset);
        if (direction == 'up') setShowShortcuts(true)
        else setShowShortcuts(false)
    }
    const getThemeLeft = (index) => {
        const modifiedIndex = index % theme.length
        return theme[((modifiedIndex * 2) + 1) % theme.length]
    }

    const getThemeRight = (index) => {
        const modifiedIndex = index % theme.length
        return theme[(modifiedIndex * 2) % theme.length]
    }

    const findSearch = (value) => {
        var tempNotes = [...data]
        var x = tempNotes.filter(record => record.title.includes(value))
        setNotes(x)
        setSearch(value)
    }

    const save = () => {
        const newNote = [{
            id: 3,
            title: title,
            description: 'Yes you can make it online easily just follow it simply',
            date: 'May 21,2020'
        }]
        const newNoteObj = [...notes, ...newNote]
        setSelectedItemsCount(0)
        setNotes(newNoteObj)
        setModalVisible(!modalVisible)
        clearNewNotes()
    }
    const longPress = (item) => {
        item.selected = !item.selected
        var foundIndex = notes.findIndex(x => x.id == item.id);
        var tempNotes = [...notes];
        tempNotes[foundIndex] = item;
        calculateSelected(tempNotes)
        setNotes(tempNotes)
    }
    const press = (item) => {
        if (selectedItemsCount > 0) longPress(item)
        else {
            longPress(item)
            setTitle(item.title)
            setDescription(item.description)
            setModalVisible(!modalVisible)
        }
    }
    const calculateSelected = () => {
        var count = 0
        notes.forEach((item) => {
            if (item.selected) count = count + 1
        })
        setSelectedItemsCount(count)
    }
    const close = () => {
        var tempNotes = [...notes]
        tempNotes.forEach((item) => {
            if (item.selected) item.selected = !item.selected
        })
        closeRef.current.rotate(300)
        iconRef.current.bounceOutUp()
        setTimeout(() => {
            setSelectedItemsCount(0)
        }, 500);
    }

    const deleteNote = () => {
        var tempNotes = [...notes]
        var deletedNote = []
        tempNotes.forEach((item) => {
            if (!item.selected) deletedNote.push(item)
        })
        cardsRef.current.rotate(300)
        setTimeout(() => {
            cardsRef.current.bounceOutLeft()
        }, 300);
        setTimeout(() => {
            iconRef.current.bounceOutUp()
        }, 500);
        setTimeout(() => {
            setNotes(deletedNote)
            setSelectedItemsCount(0)
            showToast("Note deleted Sucessfuly")
        }, 900);
    }
    const editNote = () => {
        var tempNotes = [...notes]
        var editNote = []
        tempNotes.forEach((item) => {
            if (item.selected) editNote.push(item)
        })
        setTitle(editNote[0].title)
        setDescription(editNote[0].description)
        setModalVisible(!modalVisible)
        close()
    }
    const renderItemLeft = ({ item, index }) => {
        if (index % 2 == 0) return
        return (
            <Animatable.View animation="slideInUp" iterationCount={1} direction="alternate" >
                <TouchableOpacity onLongPress={() => longPress(item)} onPress={() => press(item)}>
                    <View style={{ backgroundColor: nightMode ? '#3a3a3a' : getThemeLeft(index), padding: 20, borderRadius: 7, marginBottom: 10, borderWidth: item.selected ? 2 : 0, borderColor: nightMode ? 'white' : 'black' }}>
                        <Text style={{ fontSize: 16, color: nightMode ? 'white' : 'black' }}>{item.title.substring(0, 60)}</Text>
                        <Text style={{ color: nightMode ? '#a6a6a6' : '#666666', marginTop: 10 }}>{item.date}</Text>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ color: nightMode ? '#a6a6a6' : '#666666', marginTop: 2, fontSize: 12 }}>{item.time}</Text>
                            <TouchableOpacity>
                                <AntDesign name="sync" size={10} color="#fff" style={{ padding: 4 }} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Animatable.View>
        )
    }
    const renderItemRight = ({ item, index }) => {
        if (index % 2 != 0) return
        return (
            <Animatable.View animation="slideInUp" iterationCount={1} direction="alternate" >
                <TouchableOpacity onLongPress={() => longPress(item)} onPress={() => press(item)}>
                    <View style={{ backgroundColor: nightMode ? '#3a3a3a' : getThemeRight(index), padding: 20, borderRadius: 7, marginBottom: 10, borderWidth: item.selected ? 2 : 0, borderColor: nightMode ? 'white' : 'black' }}>
                        <Text style={{ fontSize: 16, color: nightMode ? 'white' : '969696' }}>{item.title.substring(0, 60)}</Text>
                        <Text style={{ color: nightMode ? '#a6a6a6' : '#666666', marginTop: 10 }}>{item.date}</Text>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ color: nightMode ? '#a6a6a6' : '#666666', marginTop: 2, fontSize: 12 }}>{item.time}</Text>
                            <TouchableOpacity>
                                <AntDesign name="sync" size={10} color="#fff" style={{ padding: 4 }} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Animatable.View>
        )
    }
    const onShare = async () => {
        var tempNotes = [...notes]
        var shareNote = []
        tempNotes.forEach((item) => {
            if (item.selected) shareNote.push(item)
        })
        try {
            const result = await Share.share({
                message:
                    shareNote[0].title,
            });
            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                } else {
                    // shared
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
            }
        } catch (error) {
            alert(error.message);
        }
    }
    return (
        <SafeAreaView style={{ height: Dimensions.get('window').height, backgroundColor: nightMode ? 'black' : 'white' }}>
            <View style={{ width: '90%', alignSelf: 'center' }}>
                {selectedItemsCount > 0 ?
                    <Animatable.View ref={iconRef} animation="bounceInDown" iterationCount={1} direction="alternate" >
                        <View style={{ flexDirection: 'row', marginTop: '3%', marginBottom: '3%', backgroundColor: 'grey', padding: 5, borderRadius: 10 }}>
                            <View style={{ flex: .3, flexDirection: 'row' }}>
                                <Animatable.View ref={closeRef}>
                                    <TouchableOpacity onPress={() => close()} style={{ padding: 5, backgroundColor: "#3b3b3b", borderRadius: 10 }}>
                                        <EvilIcons name="close" size={30} color="#fff" />
                                    </TouchableOpacity>
                                </Animatable.View>
                                <View style={{ justifyContent: 'center', marginLeft: 10 }}>
                                    <Text style={{ fontSize: 25, color: 'white' }}>{selectedItemsCount}</Text>
                                </View>
                            </View>
                            <View style={{ flex: .7, flexDirection: 'row', justifyContent: 'flex-end' }}>
                                <Animatable.View ref={cardsRef}>
                                    <TouchableOpacity
                                        onPress={() => deleteNote()}
                                        style={{ padding: 5, borderRadius: 10 }}
                                        onLongPress={() => {
                                        }}>
                                        <MaterialCommunityIcons name="delete" size={25} color="#fff" />
                                    </TouchableOpacity>
                                </Animatable.View>
                                {selectedItemsCount == 1 &&
                                    <>
                                        <TouchableOpacity onPress={editNote} style={{ padding: 5, borderRadius: 10 }}>
                                            <MaterialIcons name="edit" size={25} color="#fff" />
                                        </TouchableOpacity>

                                        <TouchableOpacity onPress={copy} style={{ padding: 5, borderRadius: 10 }}>
                                            <Feather name="copy" size={25} color="#fff" />
                                        </TouchableOpacity>

                                        <TouchableOpacity onPress={onShare} style={{ padding: 5, borderRadius: 10 }}>
                                            <Entypo name="share" size={25} color="#fff" />
                                        </TouchableOpacity>
                                    </>
                                }
                            </View>
                        </View>
                    </Animatable.View>
                    :
                    <View ref={iconRef} style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: '3%', marginBottom: '3%', backgroundColor: nightMode ? 'grey' : '#b3b3b3', padding: 5, borderRadius: 10 }}>
                        <View style={{ justifyContent: 'center' }}>
                            <TextInput
                                placeholder={'Find Notes'}
                                placeholderTextColor="#fff"
                                style={{ fontSize: 25, fontWeight: '500', color: '#fff', padding: -100 }}
                                onChangeText={findSearch}
                                value={search}
                            />
                            {/* <Text style={{ fontSize: 25, fontWeight: '500', color: '#fff' }}>Notes</Text> */}
                        </View>
                        <TouchableOpacity style={{ padding: 5, backgroundColor: "#969696", borderRadius: 10 }}>
                            <EvilIcons name="search" size={30} color="#fff" />
                        </TouchableOpacity>
                    </View>
                }
                {notes.length > 0 ?
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        onScroll={onScroll}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor={nightMode ? 'white' : 'black'}
                                progressBackgroundColor={nightMode ? 'white' : 'grey'}
                                colors={nightMode ? ['black'] : ['white']}
                            />
                        }
                    >

                        <View style={{ flexDirection: 'row', alignContent: 'space-around', marginBottom: '30%' }}>
                            <View style={{ width: '48%' }}>
                                <FlatList
                                    data={notes}
                                    renderItem={renderItemLeft}
                                    keyExtractor={item => item.id}
                                />
                            </View>
                            <View style={{ width: '48%', marginLeft: '4%' }}>
                                <FlatList
                                    data={notes}
                                    renderItem={renderItemRight}
                                    keyExtractor={item => item.id}
                                />
                            </View>
                        </View>

                    </ScrollView>
                    :
                    <View style={{ alignItems: 'center', width: '80%', justifyContent: 'center', alignSelf: 'center', height: Dimensions.get('window').height * 0.6 }}>
                        <Ionicons name="document-text-outline" size={150} color={nightMode ? 'grey' : '#e0e0e0'} />
                        <Text style={{ color: 'grey' }}>Add notes by tapping + icon</Text>
                    </View>
                }
            </View >
            {(selectedItemsCount == 0 && showShortcuts) &&
                <Animatable.View animation="slideInUp" iterationCount={1} direction="alternate" style={{ bottom: Platform.OS === 'ios' ? 60 : 40 }}>
                    <TouchableOpacity
                        onPress={() => { setModalVisible(!modalVisible) }}
                        style={[styles.touchableOpacityStyle, { backgroundColor: nightMode ? 'black' : '#3b3b3b' }]}>
                        <Animatable.View animation="pulse" easing="ease-in-out-back" iterationCount="infinite">
                            <Feather name="plus" size={30} color="#fff" />
                        </Animatable.View>
                    </TouchableOpacity>
                </Animatable.View>
            }
            {
                (selectedItemsCount == 0 && showShortcuts) &&
                <Animatable.View animation="slideInUp" iterationCount={1} direction="alternate" style={{ bottom: Platform.OS === 'ios' ? 60 : 40 }}>
                    <TouchableOpacity
                        onPress={() => { setNightMode(!nightMode) }}
                        style={[styles.touchableOpacityStyle, { bottom: Platform.OS === 'ios' ? 80 : 100, backgroundColor: nightMode ? 'black' : '#3b3b3b' }]}>
                        <Feather name={nightMode ? "sun" : "moon"} size={30} color="#fff" />
                    </TouchableOpacity>
                </Animatable.View>
            }
            <Modal
                animationType="slide"
                //transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    alert("Modal has been closed.");
                    setModalVisible(!modalVisible);
                }}
            >
                <SafeAreaView style={{ backgroundColor: nightMode ? 'black' : 'white', width: '100%', height: Dimensions.get('window').height }}>
                    <View style={{ width: '90%', alignSelf: 'center', backgroundColor: nightMode ? 'black' : 'white' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: '3%', marginBottom: '3%', padding: 5, borderRadius: 10 }}>
                            <View>
                                <TouchableOpacity onPress={() => { clearNewNotes(), setModalVisible(!modalVisible) }} style={{ padding: 3, backgroundColor: "#3b3b3b", borderRadius: 10 }}>
                                    <Entypo name="chevron-small-left" size={30} color="#fff" />
                                </TouchableOpacity>
                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                <TouchableOpacity onPress={() => { deleteNote(), setModalVisible(!modalVisible) }} style={{ marginRight: 10, padding: 5, backgroundColor: "#3b3b3b", borderRadius: 10 }}>
                                    <MaterialCommunityIcons name="delete" size={25} color="#fff" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => { copyOnly() }} style={{ marginRight: 10, padding: 5, backgroundColor: "#3b3b3b", borderRadius: 10 }}>
                                    <Feather name="copy" size={25} color="#fff" />
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => { onShare() }} style={{ marginRight: 10, padding: 5, backgroundColor: "#3b3b3b", borderRadius: 10 }}>
                                    <Entypo name="share" size={25} color="#fff" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => save()} style={{ padding: 3, paddingLeft: 10, paddingRight: 10, backgroundColor: "#3b3b3b", borderRadius: 10, justifyContent: 'center' }}>
                                    <Text style={{ color: '#fff' }}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={{ marginTop: 10 }}>
                            <TextInput
                                placeholder={'Title'}
                                placeholderTextColor="grey"
                                style={[styles.input, { color: nightMode ? 'white' : 'black' }]}
                                onChangeText={setTitle}
                                value={title}
                                multiline
                            />
                        </View>
                        <View style={{ marginTop: 20 }}>
                            <TextInput
                                placeholder={'Type something...'}
                                placeholderTextColor="grey"
                                style={[styles.input, { fontSize: 15, color: nightMode ? 'white' : 'black' }]}
                                onChangeText={setDescription}
                                value={description}
                                multiline
                            />
                        </View>
                    </View>
                </SafeAreaView>
            </Modal>
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    touchableOpacityStyle: {
        position: 'absolute',
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        right: 30,
        bottom: Platform.OS === 'ios' ? 20 : 40,
        backgroundColor: '#3b3b3b',
        borderRadius: 100
    },
    floatingButtonStyle: {
        resizeMode: 'contain',
        width: 50,
        height: 50,
        //backgroundColor:'black'
    },
    input: {
        fontSize: 25,
        marginLeft: '2%'
    }
})
export default Homescreen;