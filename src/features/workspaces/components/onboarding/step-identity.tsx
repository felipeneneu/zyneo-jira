import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWizard } from "./store";
import { WizardStepLayout } from "./wizard-step-layout";
import { step2Schema } from "./schemas";

import workspaceOptions from "./workspace-options.json";
import { Label } from "@/src/ui/label";
import { Input } from "@/src/ui/input";
import { Button } from "@/src/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/ui/select";
import { FaImage, FaXmark } from "react-icons/fa6";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/ui/avatar";

type Step4FormData = {
  name: string;
  description?: string;
};

  export function StepIdentity() {
  const { state, dispatch } = useWizard();
  
  // Dynamic Options
  const descriptionOptions = state.type 
    ? workspaceOptions[state.type as keyof typeof workspaceOptions] || [] 
    : [];

  const [imagePreview, setImagePreview] = useState<string | null>(
    typeof state.image === 'string' ? state.image : (state.image ? URL.createObjectURL(state.image) : null)
  );
  
  const { register } = useForm<Step4FormData>({
    resolver: zodResolver(step2Schema.omit({ image: true })),
    defaultValues: {
      name: state.name,
      description: state.description ?? "",
    },
    mode: "onChange"
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      dispatch({
        type: "SET_IDENTITY",
        payload: { name: state.name, description: state.description, image: file },
      });
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    dispatch({
      type: "SET_IDENTITY",
      payload: { name: state.name, description: state.description, image: undefined },
    });
  };

  return (
    <WizardStepLayout
      title="Por fim, qual nome você gostaria de dar ao seu Espaço de trabalho?"
      description="Insira o nome da equipe ou organização."
    >
      <div className="space-y-8 max-w-lg mx-auto mt-6">
        <div className="flex flex-col items-center gap-4">
          {/* Avatar Upload UI */}
          <div className="relative group cursor-pointer">
            <Avatar className="size-24 border-2 border-dashed border-gray-700 bg-gray-900/50 group-hover:border-purple-500/50 transition-colors">
              <AvatarImage src={imagePreview || ""} className="object-cover" />
              <AvatarFallback className="bg-transparent">
                <FaImage className="h-8 w-8 text-gray-500 group-hover:text-purple-400 transition-colors" />
              </AvatarFallback>
            </Avatar>

            {imagePreview ? (
              <Button
                size="icon"
                variant="destructive"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                onClick={handleRemoveImage}
              >
                <FaXmark className="h-3 w-3" />
              </Button>
            ) : (
              <Input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleImageChange}
              />
            )}
          </div>
          <p className="text-xs text-gray-400">
            Toque para enviar ícone (opcional)
          </p>
        </div>

        <div className="space-y-3 text-left">
          <Label htmlFor="workspace-name" className="text-gray-300">
            Nome do espaço de trabalho
          </Label>
          <Input
            id="workspace-name"
            placeholder="Ex: Minha Empresa"
            {...register("name", {
              onChange: (e) =>
                dispatch({
                  type: "SET_IDENTITY",
                  payload: {
                    name: e.target.value,
                    description: state.description,
                    image: state.image,
                  },
                }),
            })}
            className="h-12 border-gray-700 bg-gray-900/50 text-white placeholder:text-gray-500 focus-visible:ring-purple-500/50"
          />
        </div>

        <div className="space-y-3 text-left">
          <Label htmlFor="workspace-description" className="text-gray-300">
            Descricao pre-definida
          </Label>
            <Select
              onValueChange={(value) =>
                dispatch({
                  type: "SET_IDENTITY",
                  payload: {
                    name: state.name,
                    description: value,
                    image: state.image,
                  },
                })
              }
              value={state.description}
            >
              <SelectTrigger className="w-full h-12 bg-zinc-900/50 border-zinc-800 text-zinc-100 focus:ring-purple-500/50 focus:border-purple-500/50">
                <SelectValue placeholder="Selecione uma opção" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                {descriptionOptions.map((desc) => (
                  <SelectItem
                    key={desc}
                    value={desc}
                    className="focus:bg-zinc-800 focus:text-zinc-100 cursor-pointer"
                  >
                    {desc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
        </div>
      </div>
    </WizardStepLayout>
  );
}
