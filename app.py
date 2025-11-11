import torch
from transformers import (
    AutoModelForCausalLM, 
    AutoTokenizer, 
    BitsAndBytesConfig
)
from peft import PeftModel
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # <<< THÊM: Import CORS
from pydantic import BaseModel
from typing import List, Dict # <<< THAY ĐỔI 0: Import thêm List, Dict

# --- 1. TẢI MODEL (Giữ nguyên) ---
print("--- BẮT ĐẦU TẢI MODEL (CÓ THỂ MẤT VÀI PHÚT) ---")
base_model_name = "meta-llama/Meta-Llama-3.1-8B-Instruct" 
adapter_path = "D:/Work/AI/results_reframebot_llama3/checkpoint-700" # (Dùng đường dẫn tuyệt đối của bạn)

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.bfloat16,
)
tokenizer = AutoTokenizer.from_pretrained(base_model_name)
tokenizer.pad_token = tokenizer.eos_token
base_model = AutoModelForCausalLM.from_pretrained(
    base_model_name,
    quantization_config=bnb_config,
    device_map={"": 0},
    trust_remote_code=True
)
model = PeftModel.from_pretrained(base_model, adapter_path)
model = model.merge_and_unload() 
model.eval()
print("--- MODEL ĐÃ SẴN SÀNG! KHỞI ĐỘNG API... ---")

# --- 2. KHỞI TẠO API SERVER ---
app = FastAPI()

# <<< THÊM: Cấu hình CORS để cho phép kết nối từ trình duyệt >>>
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cho phép tất cả origins
    allow_credentials=True,
    allow_methods=["*"],  # Cho phép tất cả HTTP methods (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],  # Cho phép tất cả headers
)

# <<< THAY ĐỔI 1: Yêu cầu "history" là một LIST các dict >>>
class ChatRequest(BaseModel):
    # history sẽ là: [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]
    history: List[Dict[str, str]] 

# <<< THAY ĐỔI 2: Sửa hàm get_response để nhận "history" >>>
def get_response(message_history: List[Dict[str, str]]):
    # Thêm system prompt vào ĐẦU của lịch sử chat
    messages = [
        {"role": "system", "content": "You are ReframeBot. You are a compassionate assistant that helps university students reframe negative thoughts about their academic stress using CBT techniques. You must be empathetic, non-judgmental, and guide them with Socratic questions. Do not give direct advice."}
    ]
    
    # Nối lịch sử chat (user + assistant) vào sau
    messages.extend(message_history)
    
    # (Code bên dưới giữ nguyên y hệt, dùng 'messages' thay vì 'prompt_text')
    prompt_string = tokenizer.apply_chat_template(
        messages,
        add_generation_prompt=True,
        tokenize=False
    )
    
    inputs = tokenizer(
        prompt_string, 
        return_tensors="pt",
        padding=False
    ).to(model.device)

    terminators = [
        tokenizer.eos_token_id,
        tokenizer.convert_tokens_to_ids("<|eot_id|>")
    ]

    with torch.no_grad():
        outputs = model.generate(
            input_ids=inputs.input_ids,
            attention_mask=inputs.attention_mask,
            max_new_tokens=256, 
            eos_token_id=terminators, 
            do_sample=True,
            temperature=0.6, 
            top_p=0.9,
        )
    
    response_ids = outputs[0][inputs.input_ids.shape[-1]:]
    response = tokenizer.decode(response_ids, skip_special_tokens=True)
    return response

# --- 3. ĐỊNH NGHĨA ENDPOINT ---
@app.get("/")
def read_root():
    return {"message": "ReframeBot API đang chạy!"}

# <<< THAY ĐỔI 3: Sửa endpoint /chat để dùng "history" >>>
@app.post("/chat")
def chat_endpoint(request: ChatRequest):
    # Lấy toàn bộ history từ request
    user_history = request.history
    
    # Gọi hàm xử lý với toàn bộ history
    bot_response = get_response(user_history)
    
    # Trả về kết quả
    return {"response": bot_response}

# --- 4. CHẠY SERVER ---
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)