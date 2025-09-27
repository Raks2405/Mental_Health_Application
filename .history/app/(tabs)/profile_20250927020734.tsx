import { FontAwesome } from "@expo/vector-icons";
import CheckBox from 'expo-checkbox';
import { router, useGlobalSearchParams } from "expo-router";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { logOut } from '../../src/auth';
import { auth } from '../../src/firebase';
import { useUser } from "@/src/UserContext";


export default function Profile() {
    const { email } = useGlobalSearchParams<{ email: string }>();
    const {user} = useUser();
    const [showPwdScreen, setShowPwdScreen] = useState(false);
    const [currPwd, setCurrPwd] = useState('');
    const [newPwd, setNewPwd] = useState('');
    const [confirmPwd, setConfirmPwd] = useState('');
    const [saving, setSaving] = useState(false);
    const [isSelectedCurrPwd, setSelectionCurrPwd] = useState(false);
    const [isSelectedNewPwd, setSelectionNewPwd] = useState(false);
    const [isSelectedConfirmPwd, setSelectionConfirmPwd] = useState(false);
    
    const handleChangePassword = async () => {
        if (!currPwd || !newPwd || !confirmPwd)
            return Alert.alert('Error', 'All fields are required');
        if (newPwd.length < 6)
            return Alert.alert('Error', 'New password must be at least 6 characters');
        if (newPwd !== confirmPwd)
            return Alert.alert('Error', 'Passwords do not match');

        const user = auth.currentUser;
        if (!user || !user.email) return Alert.alert('Error', 'No authenticated user');

        try {
            setSaving(true);
            const cred = EmailAuthProvider.credential(user.email, currPwd);
            await reauthenticateWithCredential(user, cred); // required by Firebase
            await updatePassword(user, newPwd);
            setShowPwdScreen(false);
            setCurrPwd(''); setNewPwd(''); setConfirmPwd('');
            Alert.alert('Success', 'Password changed');
        } catch (e) {
            Alert.alert('Failed', 'Check your current password and try again.');
        } finally {
            setSaving(false);
        }
    };


    return (
        <View style={styles.card}>
            <View style={styles.name_iconContainer}>
                <FontAwesome style={styles.userIcon} name="user-circle" size={100} color={'gray'} />
                
                <Text style={styles.name}>{user?.email}</Text>
            </View>
            <View style={styles.subCard}>

                <Pressable style={{ flexDirection: 'row' }}
                    onPress={async () => {
                        console.log(email);
                        //handle logout functionality here
                        Alert.alert('Logout', 'Are you sure you want to logout?', [
                            { text: 'Cancel' },
                            {
                                text: 'OK', onPress: async () => {
                                    try {
                                        await logOut();
                                        console.log('User logged out');
                                        router.replace({
                                            pathname: '/goodbye',
                                        })
                                    } catch (error) {
                                        console.log('Error logging out: ', error);
                                        Alert.alert('Error', 'An error occurred while logging out. Please try again.');
                                    }

                                }
                            }
                        ])
                    }}>
                    <FontAwesome name='sign-out' size={24} color='gray' margin='10' />
                    <Text style={{ fontSize: 16, fontWeight: '500', color: 'black', margin: 10 }}>Logout</Text>
                </Pressable>
            </View>

            <View style={{...styles.subCard,
                 backgroundColor: user?.email === 'Guest' ? 'lightgray' : 'white',
                 borderColor: user?.email === 'Guest' ? 'lightgray' : 'white' }}>
                <Pressable
                    disabled={user?.email === 'Guest'}
                    style={{
                        flexDirection: 'row',

                    }}
                    onPress={() => setShowPwdScreen(true)}
                >
                    <FontAwesome name='lock' size={24} color='gray' margin='10' />
                    <Text style={{ fontSize: 16, fontWeight: '500', color: 'black', margin: 10 }}>Change Password</Text>
                </Pressable>

                <Modal visible={showPwdScreen} transparent animationType="fade" onRequestClose={() => setShowPwdScreen(false)}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.centered}>
                        <Pressable style={styles.backdrop} onPress={() => !saving && setShowPwdScreen(false)} />
                        <View style={styles.modalCard}>
                            <Text style={styles.modalTitle}>Change Password</Text>

                            <TextInput
                                secureTextEntry={!isSelectedCurrPwd} placeholder="Current password"
                                value={currPwd} onChangeText={setCurrPwd} style={styles.input}
                            />
                            <View style={styles.checkboxContainer}>
                                <CheckBox value={isSelectedCurrPwd} onValueChange={setSelectionCurrPwd} style={styles.checkbox} />
                                <Text style={styles.label}>Show password</Text>
                            </View>


                            <TextInput
                                secureTextEntry={!isSelectedNewPwd} placeholder="New password (min 6)"
                                value={newPwd} onChangeText={setNewPwd} style={styles.input}
                            />
                            <View style={styles.checkboxContainer}>
                                <CheckBox value={isSelectedNewPwd} onValueChange={setSelectionNewPwd} style={styles.checkbox} />
                                <Text style={styles.label}>Show password</Text>
                            </View>
                            <TextInput
                                secureTextEntry={isSelectedConfirmPwd} placeholder="Confirm new password"
                                value={confirmPwd} onChangeText={setConfirmPwd} style={styles.input}
                            />
                            <View style={styles.checkboxContainer}>
                                <CheckBox value={isSelectedConfirmPwd} onValueChange={setSelectionConfirmPwd} style={styles.checkbox} />
                                <Text style={styles.label}>Show password</Text>
                            </View>

                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                                <Pressable disabled={saving} onPress={() => setShowPwdScreen(false)} style={[styles.btn, styles.btnOutline]}>
                                    <Text>Cancel</Text>
                                </Pressable>
                                <View style={{ width: 12 }} />
                                <Pressable disabled={saving} onPress={handleChangePassword} style={styles.btn}>
                                    <Text style={{ color: '#fff' }}>{saving ? 'Saving...' : 'Save'}</Text>
                                </Pressable>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </Modal>

            </View>
        </View >

    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        backgroundColor: 'rgba(215, 228, 226, 0.96)',
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        padding: 16,
        margin: 16,

        ...Platform.select({
            ios: {
                shadowOffSet: { width: 2, height: 2 },
                shadowColor: '#000000ff',
                shadowOpacity: 0.3,
                shadowRadius: 4,
            },

            android: {
                elevation: 5,
            }
        })

    },

    centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
    modalCard: { width: '88%', backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 6 },
    modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 10, marginBottom: 10 },
    btn: { backgroundColor: '#0a84ff', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
    btnOutline: { backgroundColor: '#eee' },


    subCard: {
        backgroundColor: 'white',

        paddingTop: 5,
        paddingBottom: 5,
        paddingStart: 1,
        paddingEnd: 1,

        marginTop: 10,
        marginBottom: 2,
        marginStart: 2,
        marginEnd: 2,

        alignSelf: 'stretch',
        borderWidth: 1,
        borderRadius: 5,
        borderColor: 'white',

        justifyContent: 'space-between',
        ...Platform.select({

            ios: {
                shadowOffSet: { width: 2, height: 2 },
                shadowColor: '#000000ff',
                shadowOpacity: 0.3,
                shadowRadius: 4,
            },

            android: {
                elevation: 5,
            }
        })

    },

    name_iconContainer: {
        flexDirection: 'column',
        marginBottom: 16,
    },

    userIcon: {
        padding: 20,
        marginStart: 10,
        alignSelf: 'center',
    },

    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black',
        marginEnd: 10,
        marginStart: 10,
        textAlign: 'center',
    },

    checkboxContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    checkbox: {
        alignSelf: 'center',
    },
    label: {
        margin: 8,
    },

});

