"use client"

import { useState } from "react";
import { generatePDF } from "@/utils/generatePDF";

export default function Home() {
    const [formData, setFormData] = useState({
      description: "",
      date: "",
      client: "",
      value: "",
      valueInWords: "",
      signature: ""
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const {name, value} = e.target;
      setFormData({
        ...formData, 
        [name]: value,
      });

      if (name === "value"){
        setFormData({
          ...formData,
          value,
          valueInWords: `${value} (por extenso simulado)`
        });
      }
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      try {
        const response = await fetch("api/receipts", {
            method: "POST", 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (response.ok) {
          alert ("Nota salva com sucesso!");

          generatePDF(formData);

          setFormData({
            description: "",
            date: "",
            client: "",
            value: "",
            valueInWords: "",
            signature: "",
          });
        } else {
          alert (`Erro ao salvar nota: ${data.message}`);
        }
      } catch(error) {
        console.log ("Erro ao enviar formulario:", error);
        alert("Erro ao salvar a nota");
      };
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
          <h1 className="text-3xl font-bold mb-6">
              Geração de Notas de Serviços
          </h1>
          <form 
            onSubmit={handleSubmit}
            className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full space-y-4"
          >
            <div>
              <label 
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
                > 
                  Descrição do Serviço
              </label>
              <textarea 
              name="description" 
              id="description" 
              value={formData.description} 
              onChange={handleInputChange} 
              placeholder="Ex.: Divugação de evento" 
              rows={3}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label 
              htmlFor="date"
              className="block text-sm font-medium text-gray-700"
              > 
              Data do Serviço
              </label>
              <input 
              type="date" 
              name="date" 
              id="dete" 
              value={formData.date} 
              onChange={handleInputChange} 
              placeholder="Ex.: Divugação de evento" 
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label 
              htmlFor="client"
              className="block text-sm font-medium text-gray-700"
              > 
              Fundo / Cliente
              </label>
              <input 
              type="text" 
              name="client" 
              id="client" 
              value={formData.client} 
              onChange={handleInputChange} 
              placeholder="Ex.: Fundo Maria Fernanda"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label 
              htmlFor="value" 
              className="block text-sm font-medium text-gray-700"> 
              Valor(R$) 
              </label>
              <input 
              type="number" 
              name="value" 
              id="value" 
              value={formData.value} 
              onChange={handleInputChange} 
              placeholder="Ex.: 300" 
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-2 text-sm text-gray-500">
                Valor por extenso: <span className="font-medium">{formData.valueInWords}</span>
              </p>
            </div>

            <div>
              <label 
                htmlFor="signature" 
                className="block text-sm font-medium text-gray-700">
                  Assinatura
              </label>
              <input 
                type="text" 
                name="signature"
                id="signature" 
                value={formData.signature} 
                onChange={handleInputChange} 
                placeholder="Ex.: Nome do responsavel"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"> 
              Gerar nota
            </button>
          </form>
        </div>
    );
}
