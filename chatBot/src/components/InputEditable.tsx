import React, {useEffect, useRef} from "react";

type InputEditableProps = {
  value: string;
  onSubmit: () => void;
  handleInput: (value: string) => void;
};

const InputEditable: React.FC<InputEditableProps> = ({ value, onSubmit, handleInput }) => {
    const editableRef = useRef<HTMLDivElement>(null);
    const caretPosition = useRef<Range | null>(null);

    const saveCaretPosition = () : void => {
        const selection = window.getSelection();
        if (!selection || !editableRef.current) return;
    
        caretPosition.current = selection.getRangeAt(0).cloneRange();
        return;
        ;
      };

        // Keep caret position constant when value changes
        useEffect(() => {
        if (editableRef.current && caretPosition.current) {
            editableRef.current.textContent = value; // Update content
            restoreCaretPosition(); // Restore caret
        }
        }, [value]);
    
      const restoreCaretPosition = () => {
        if (!caretPosition.current || !editableRef.current) return;
        console.log(caretPosition.current);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(caretPosition.current);
      };

    return(
        <div
        ref = {editableRef}
        contentEditable
        className="content-editable"
        onInput={(e) => {
            const range = saveCaretPosition();
            handleInput(e.currentTarget.textContent || "")
        }
            
        }
            
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
          }
        }}
      >{value}</div>
    )
};

export default InputEditable;