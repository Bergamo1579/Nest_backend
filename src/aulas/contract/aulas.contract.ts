export interface IAula {
  id: string;
  titulo: string;
  descricao: string;
  icon_src: string; // Certifique-se de que o tipo é string
  criado_em: Date; // Campo obrigatório
}