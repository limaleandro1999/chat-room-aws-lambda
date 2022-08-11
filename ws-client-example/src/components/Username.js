import { useState } from "react";

export function UsernameForm({ setUsername }) {
  const [formValue, setFormValue] = useState("");

  return (
    <div>
      <input 
        type="text" 
        value={formValue} 
        onChange={e => setFormValue(e.target.value)} 
        onKeyDown={e => e.key === "Enter" ? setUsername(formValue) : null}
      />
      <button onClick={() => setUsername(formValue)}>Set username</button>
    </div>
  );
}
