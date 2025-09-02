interface ProductProps {
    title: string;
    price?: string;
    image: string;
    type: "market" | 'display';
    onPress?: () => void
}