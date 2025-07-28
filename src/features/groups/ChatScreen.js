import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NavigationIcons, ChatIcons } from '../../PngIcons';
import { firestore } from '../../firebase';
import { AuthService } from '../../services/AuthService';
import { GroupService } from '../../services/GroupService';

const ChatScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { chatId, isGroupChat = false, matchedUser, group } = route.params;
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  
  useEffect(() => {
    const user = AuthService.getCurrentUser();
    setCurrentUser(user);
    
    fetchChatData();
    
    // Subscribe to messages
    const unsubscribe = firestore()
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .orderBy('sentAt', 'desc')
      .onSnapshot(snapshot => {
        const messageList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          sentAt: doc.data().sentAt ? doc.data().sentAt.toDate() : new Date()
        }));
        setMessages(messageList);
        setLoading(false);
      });
    
    return () => unsubscribe();
  }, [chatId]);
  
  const fetchChatData = async () => {
    try {
      // Get chat data
      const chatDoc = await firestore().collection('chats').doc(chatId).get();
      const chatData = chatDoc.data();
      
      // Get participants data
      const participantPromises = chatData.participants.map(async userId => {
        const userDoc = await firestore().collection('users').doc(userId).get();
        return {
          id: userId,
          ...userDoc.data()
        };
      });
      
      const participantData = await Promise.all(participantPromises);
      setParticipants(participantData);
    } catch (error) {
      console.error('Error fetching chat data:', error);
    }
  };
  
  const sendMessage = async () => {
    if (!inputText.trim()) return;
    
    try {
      const userId = currentUser.uid;
      
      // Add message to chat
      await firestore()
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .add({
          text: inputText.trim(),
          sentBy: userId,
          sentAt: firestore.FieldValue.serverTimestamp(),
          readBy: [userId],
          status: 'sent'
        });
      
      // Update last message in chat
      await firestore()
        .collection('chats')
        .doc(chatId)
        .update({
          lastMessage: {
            text: inputText.trim(),
            sentBy: userId,
            sentAt: firestore.FieldValue.serverTimestamp()
          }
        });
      
      // Clear input
      setInputText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  const renderHeader = () => {
    let title = '';
    let subtitle = '';
    let avatar = null;
    
    if (isGroupChat && group) {
      title = group.name;
      subtitle = `${participants.length} members`;
    } else if (matchedUser) {
      title = matchedUser.displayName;
      subtitle = `${matchedUser.branch}, Year ${matchedUser.year}`;
      avatar = matchedUser.photoURL;
    } else if (participants.length > 0) {
      const otherUser = participants.find(p => p.id !== currentUser.uid);
      if (otherUser) {
        title = otherUser.displayName;
        subtitle = `${otherUser.branch}, Year ${otherUser.year}`;
        avatar = otherUser.photoURL;
      }
    }
    
    return (
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <NavigationIcons.ArrowLeft size={24} />
        </TouchableOpacity>
        
        {isGroupChat ? (
          <View style={styles.groupIconContainer}>
            <ChatIcons.Group size={24} />
          </View>
        ) : (
          avatar && (
            <Image 
              source={{ uri: avatar }} 
              style={styles.avatar} 
            />
          )
        )}
        
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerSubtitle}>{subtitle}</Text>
        </View>
        
        <TouchableOpacity
          style={styles.infoButton}
          onPress={() => {
            if (isGroupChat && group) {
              navigation.navigate('GroupDetails', { groupId: group.id });
            } else if (matchedUser) {
              navigation.navigate('UserProfile', { userId: matchedUser.userId });
            }
          }}
        >
          <NavigationIcons.Search size={24} />
        </TouchableOpacity>
      </View>
    );
  };
  
  const renderMessage = ({ item }) => {
    const isCurrentUser = item.sentBy === currentUser.uid;
    const sender = participants.find(p => p.id === item.sentBy);
    const senderName = sender ? sender.displayName : 'Unknown';
    
    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
      ]}>
        {!isCurrentUser && isGroupChat && (
          <Text style={styles.messageSender}>{senderName}</Text>
        )}
        
        <View style={[
          styles.messageBubble,
          isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble
        ]}>
          <Text style={styles.messageText}>{item.text}</Text>
        </View>
        
        <Text style={styles.messageTime}>
          {item.sentAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {isCurrentUser && (
            <Text style={styles.messageStatus}>
              {' • '}
              {item.status === 'read' ? 'Read' : 'Delivered'}
            </Text>
          )}
        </Text>
      </View>
    );
  };
  
  const renderSystemMessage = ({ item }) => {
    if (item.sentBy !== 'system') return null;
    
    return (
      <View style={styles.systemMessageContainer}>
        <Text style={styles.systemMessageText}>{item.text}</Text>
      </View>
    );
  };
  
  const renderMessageItem = ({ item }) => {
    return item.sentBy === 'system' 
      ? renderSystemMessage({ item }) 
      : renderMessage({ item });
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {renderHeader()}
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0d6efd" />
        </View>
      ) : (
        <FlatList
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item.id}
          inverted
          contentContainerStyle={styles.messagesList}
        />
      )}
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        
        <TouchableOpacity
          style={[
            styles.sendButton,
            !inputText.trim() && styles.disabledSendButton
          ]}
          onPress={sendMessage}
          disabled={!inputText.trim()}
        >
          <ChatIcons.SentTick size={24} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d6efd',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  backButton: {
    marginRight: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  groupIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  infoButton: {
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    padding: 15,
  },
  messageContainer: {
    marginBottom: 15,
    maxWidth: '80%',
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
  },
  messageSender: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6c757d',
    marginBottom: 2,
    marginLeft: 10,
  },
  messageBubble: {
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  currentUserBubble: {
    backgroundColor: '#0d6efd',
  },
  otherUserBubble: {
    backgroundColor: 'white',
  },
  messageText: {
    fontSize: 16,
    color: '#212529',
  },
  currentUserBubble: {
    backgroundColor: '#0d6efd',
  },
  otherUserBubble: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
  },
  currentUserBubble: {
    backgroundColor: '#0d6efd',
  },
  otherUserBubble: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  messageText: {
    fontSize: 16,
  },
  currentUserMessage: {
    color: 'white',
  },
  otherUserMessage: {
    color: '#212529',
  },
  messageTime: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  messageStatus: {
    fontSize: 12,
    color: '#6c757d',
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  systemMessageText: {
    fontSize: 14,
    color: '#6c757d',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  input: {
    flex: 1,
    backgroundColor: '#f1f3f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0d6efd',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  disabledSendButton: {
    backgroundColor: '#e9ecef',
  },
});

export default ChatScreen;
