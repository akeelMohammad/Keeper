import React, { useState, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Appliance, ChatMessage } from '../types';
import { styles } from '../styles';

export const ChatScreen = ({ appliances }: { appliances: Appliance[] }) => {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{ id: '1', sender: 'gemini', text: "Hello! I'm your Keeper AI Assistant. Ask me anything about troubleshooting your appliances or warranty coverage." }]);
  const flatListRef = useRef<FlatList>(null);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;
    const userText = inputMessage.trim();
    setInputMessage('');
    setMessages((prev) => [...prev, { id: Date.now().toString(), sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const applianceSummary = appliances.map((a) => `- ${a.name} (${a.brand}), located in ${a.location}, purchased ${a.purchaseDate}, expires ${a.expiryDate}`).join('\n');
      const systemPrompt = `You are Keeper AI, an expert appliance troubleshooting and warranty assistant. The user has these appliances stored in their vault:\n${applianceSummary}\nHelp them troubleshoot product issues or answer warranty/repair questions concisely and helpfully.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Question: ${userText}` }] }] }),
      });
      const data = await response.json();
      const aiReply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Gemini returned no answer. Please try again.';
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), sender: 'gemini', text: aiReply }]);
    } catch (error) {
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), sender: 'gemini', text: `Gemini is unavailable: ${error instanceof Error ? error.message : 'Unknown error'}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <View style={[styles.mainContent, { paddingBottom: 0 }]}>
        <Text style={styles.title}>AI Assistant</Text>
        <FlatList 
          data={messages} keyExtractor={(item) => item.id} ref={flatListRef}
          contentContainerStyle={{ gap: 12, paddingVertical: 16 }} showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => {
            const isUser = item.sender === 'user';
            return (
              <View style={[styles.chatBubble, isUser ? styles.chatBubbleUser : styles.chatBubbleGemini]}>
                <Text style={[styles.chatText, isUser ? styles.chatTextUser : styles.chatTextGemini]}>{item.text}</Text>
              </View>
            );
          }}
        />
        {loading && <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}><ActivityIndicator color="#000000" size="small" /><Text style={{ color: '#6b7280', fontSize: 13 }}>Gemini is thinking...</Text></View>}
        <View style={styles.chatInputRow}>
          <TextInput onChangeText={setInputMessage} placeholder="Ask how to fix your appliance..." placeholderTextColor="#9ca3af" style={styles.chatInput} value={inputMessage} />
          <TouchableOpacity onPress={handleSendMessage} style={styles.chatSendButton}><Ionicons color="#ffffff" name="arrow-up" size={20} /></TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};