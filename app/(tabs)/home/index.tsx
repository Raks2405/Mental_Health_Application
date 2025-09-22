import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function Home() {
    return (
        <View style={s.container}>
            <View style={s.row}>
                <Link href='/(tabs)/home/books' asChild>
                    <Pressable style={s.cell}>
                        <Text style={{color: 'white'}}>Books</Text>
                    </Pressable>
                </Link>
                <Link href='/(tabs)/home/articles' asChild>
                    <Pressable style={s.cell}>
                        <Text style={{color: 'white'}}>Articles</Text>
                    </Pressable>
                </Link>
                <Link href='/(tabs)/home/videos' asChild>
                    <Pressable style={s.cell}>
                        <Text style={{color: 'white'}}>Videos</Text>
                    </Pressable>
                </Link>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    container: {
         flex: 1 
        },
    row: {
         flexDirection: 'row',
          width: '100%',
           paddingHorizontal: 20,
            marginTop: 15 
        },
    cell: { 
        flex: 1,
         alignItems: 'center',
          paddingVertical: 8,
          backgroundColor: '#003d53ff',
          borderRadius: 8,
          margin: 3,
        },
});



