# Quick Testing Reference Card

## 🚀 Fastest Way to Test Everything

```bash
# Run automated test suite (recommended)
./test_all.sh
```

This tests prerequisites, backend, frontend, and integration automatically!

---

## 📋 Manual Testing (Step-by-Step)

### Step 1: Test Backend Unit Tests (30 seconds)

```bash
cd Working
./run_tests.sh
```

**✅ Success:** All 70+ tests pass
**❌ Failure:** See error messages and fix issues

---

### Step 2: Start Backend Server (5 seconds)

```bash
cd Working
python server.py
```

**✅ Success:** See server banner with endpoints
**❌ Failure:** Check Ollama is running

**Keep this terminal open!**

---

### Step 3: Test Backend API (10 seconds)

**Open a NEW terminal** and run:

```bash
# Test health
curl http://localhost:3000/api/health

# Test classification
curl -X POST http://localhost:3000/api/classify \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

**✅ Success:** JSON responses returned
**❌ Failure:** Check if server is running

---

### Step 4: Test Frontend (30 seconds)

1. **Open browser:** http://localhost:3000/
2. **Check:**
   - ✅ Page loads
   - ✅ Status shows "Connected"
   - ✅ 3D character visible
   - ✅ Chat interface ready

3. **Send a test message:** "Hello"
4. **Verify:**
   - ✅ Message appears in chat
   - ✅ Response received
   - ✅ Intent panel updates
   - ✅ Character animates

**✅ Success:** All checks pass
**❌ Failure:** Check browser console (F12)

---

## 🎯 Quick Test Messages

Try these messages to test different intents:

| Message | Expected Intent |
|---------|----------------|
| "Hi there" | greeting |
| "What is this?" | question |
| "Schedule a meeting" | command |
| "Thanks" | goodbye |

---

## 🐛 Common Issues - Quick Fixes

### "Connection refused to Ollama"
```bash
ollama serve
```

### "Model not found"
```bash
ollama pull llama3.2
```

### "Port already in use"
```bash
PORT=8000 python server.py
```

### "Module not found"
```bash
pip install -r requirements.txt
```

---

## 📊 Test Checklist

Use this quick checklist:

- [ ] Backend tests pass
- [ ] Server starts successfully
- [ ] Health endpoint works
- [ ] Classify endpoint works
- [ ] Frontend loads
- [ ] Can send messages
- [ ] Intent classification accurate
- [ ] 3D animations work

---

## 🔗 Full Documentation

- **Complete Guide:** `TESTING_GUIDE.md`
- **Backend Docs:** `Working/README_PYTHON.md`
- **Quick Start:** `Working/QUICKSTART.md`

---

## ⏱️ Total Time Estimate

- **Automated test:** ~2 minutes
- **Manual testing:** ~5 minutes
- **First-time setup:** ~10 minutes (includes installing dependencies)

---

## 🎉 Success Looks Like

### Backend Console
```
═══════════════════════════════════════════════════════════
  Intent Identifier Server
═══════════════════════════════════════════════════════════
  Server running on: http://localhost:3000
  ...
✓ IntentAgent initialized successfully
```

### Browser
- Green "Connected" status
- Animated 3D character
- Working chat interface
- Intent analysis panel updating

### Test Output
```
✓ All tests passed!
```

Happy Testing! 🧪✨
