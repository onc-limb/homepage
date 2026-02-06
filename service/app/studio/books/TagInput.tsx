"use client"

import { useState, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronsUpDown, X } from "lucide-react"

interface TagInputProps {
    availableTags: string[]
    selectedTags: string[]
    onChange: (tags: string[]) => void
}

export function TagInput({ availableTags, selectedTags, onChange }: TagInputProps) {
    const [open, setOpen] = useState(false)
    const [inputValue, setInputValue] = useState("")
    const inputRef = useRef<HTMLInputElement>(null)

    function toggleTag(tag: string) {
        if (selectedTags.includes(tag)) {
            onChange(selectedTags.filter((t) => t !== tag))
        } else {
            onChange([...selectedTags, tag])
        }
    }

    function addNewTag() {
        const trimmed = inputValue.trim()
        if (trimmed && !selectedTags.includes(trimmed)) {
            onChange([...selectedTags, trimmed])
        }
        setInputValue("")
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === "Enter" && inputValue.trim()) {
            e.preventDefault()
            addNewTag()
        }
    }

    const filteredTags = availableTags.filter((tag) => !selectedTags.includes(tag))

    return (
        <div className="space-y-2">
            {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {selectedTags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                            {tag}
                            <button
                                type="button"
                                onClick={() => toggleTag(tag)}
                                className="rounded-full hover:bg-slate-300"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between text-sm font-normal text-slate-500"
                        type="button"
                    >
                        タグを選択または入力…
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-[--radix-popover-trigger-width] p-0"
                    align="start"
                >
                    <Command shouldFilter={false}>
                        <CommandInput
                            ref={inputRef}
                            placeholder="タグを検索・新規作成…"
                            value={inputValue}
                            onValueChange={setInputValue}
                            onKeyDown={handleKeyDown}
                        />
                        <CommandList>
                            <CommandEmpty>
                                {inputValue.trim() ? (
                                    <button
                                        type="button"
                                        className="w-full px-2 py-1.5 text-left text-sm hover:bg-slate-100"
                                        onClick={addNewTag}
                                    >
                                        「{inputValue.trim()}」を新規作成
                                    </button>
                                ) : (
                                    <span className="text-sm text-slate-500">
                                        タグが見つかりません
                                    </span>
                                )}
                            </CommandEmpty>
                            <CommandGroup>
                                {filteredTags
                                    .filter((tag) =>
                                        inputValue
                                            ? tag
                                                  .toLowerCase()
                                                  .includes(inputValue.toLowerCase())
                                            : true
                                    )
                                    .map((tag) => (
                                        <CommandItem
                                            key={tag}
                                            onSelect={() => {
                                                toggleTag(tag)
                                                setInputValue("")
                                            }}
                                        >
                                            {tag}
                                        </CommandItem>
                                    ))}
                                {inputValue.trim() &&
                                    !availableTags.includes(inputValue.trim()) &&
                                    filteredTags.filter((tag) =>
                                        tag
                                            .toLowerCase()
                                            .includes(inputValue.toLowerCase())
                                    ).length > 0 && (
                                        <CommandItem onSelect={addNewTag}>
                                            「{inputValue.trim()}」を新規作成
                                        </CommandItem>
                                    )}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    )
}
