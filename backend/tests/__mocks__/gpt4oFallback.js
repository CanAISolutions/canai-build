class MockGPT4oFallbackService {
  async analyzeEmotion() {
    return { arousal: 0.7, valence: 0.8, confidence: 0.9, source: 'gpt4o' };
  }
}
export default MockGPT4oFallbackService;
