interface ProductProps {
    name: string;
    price?: string;
    image: string;
    type: "market" | 'display';
    description: string,
    is_archived: boolean
    onPress?: () => void,
    id: number
}


interface UserProps {
    email?: string,
    imageUrl: string | null,
    username?: string,
    phoneNumber: string,
    address?: string,
    userId?: string,
    fullName: string,
    storeLink: string
}

interface UserStoreProps {
    user: UserProps | null,
    setUser: (value: UserProps) => void
}


interface StoreProps {
    fullName?: string,
    username?: string,
    imageUrl?: string,
    username?: string,
    phoneNumber?: string,
    address?: string,

    email?: string, 
    businessName?: string,
    description?: string,

    bankName?: string,
    accountNumber?: string,
}

interface useStoreProps {
    store: StoreProps | null,
    setStore: (value: StoreProps) => void
}


type ImageUploaderProps = {
  value?: string
  onChange: (value: string) => void
}
