type UserProfile = {
  name?: string;
  cpfCnpj?: string;
  address?: string;
  city?: string;
  state?: string;
};

export async function getCurrentUser(): Promise<UserProfile | null> {
  // TODO: replace with your actual authentication lookup.
  return {
    name: "",
    cpfCnpj: "",
    address: "",
    city: "",
    state: "",
  };
};