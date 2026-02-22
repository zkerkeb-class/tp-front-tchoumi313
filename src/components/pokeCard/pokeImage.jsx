

const PokeImage = ({ imageUrl }) => {
    const constructUrl = (url) => {
        if (!url) return null;
        
        // Static assets like /assets/uploads go directly, no /api prefix
        if (url.startsWith('/assets')) {
            return url;
        }
        
        // HTTP URLs stay as-is
        if (url.startsWith('http')) {
            return url;
        }
        
        // Local paths starting with / - check if assets path
        if (url.startsWith('/')) {
            return url;
        }
        
        // Relative paths - assume they're assets
        return `/${url}`;
    };

    return (    
        <img 
            src={constructUrl(imageUrl)} 
            alt="Pokémon" 
            className="poke-image"
            onError={(e) => {
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect fill='%23f3f4f6' width='120' height='120'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='12' fill='%236b7280'%3ENo Image%3C/text%3E%3C/svg%3E";
            }}
        />
    );
};

export default PokeImage;