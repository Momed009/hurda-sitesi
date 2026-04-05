// These types are based on the schemas in docs/backend.json

export interface SiteSetting {
    id?: string;
    siteName?: string;
    siteLogoImageId?: string;
    siteLogoImageUrl?: string;
    whatsappPhoneNumber?: string;
    contactEmail?: string;
    homepageHeroTitle?: string;
    homepageHeroSubtitle?: string;
    homepageHeroImageId?: string;
    homepageHeroImageUrl?: string;
    homepageServicesTitle?: string;
    homepageServicesSubtitle?: string;
    homepageWhyUsTitle?: string;
    homepageWhyUsSubtitle?: string;
    whyUsItem1Title?: string;
    whyUsItem1Text?: string;
    whyUsItem2Title?: string;
    whyUsItem2Text?: string;
    whyUsItem3Title?: string;
    whyUsItem3Text?: string;
    servicesPageTitle?: string;
    servicesPageSubtitle?: string;
    servicesIndustrialTitle?: string;
    servicesIndustrialText?: string;
    servicesIndustrialImageId?: string;
    servicesIndustrialImageUrl?: string;
    servicesElectronicsTitle?: string;
    servicesElectronicsText?: string;
    servicesElectronicsSubtitle?: string;
    servicesElectronicsSubtext?: string;
    servicesElectronicsImageId?: string;
    servicesElectronicsImageUrl?: string;
    servicesWholesaleTitle?: string;
    servicesWholesaleText?: string;
    listingsPageTitle?: string;
    listingsPageSubtitle?: string;
    blogPageTitle?: string;
    blogPageSubtitle?: string;
    aboutPageTitle?: string;
    aboutPageSubtitle?: string;
    aboutWhatsappTitle?: string;
    aboutWhatsappText?: string;
    aboutServiceAreasTitle?: string;
    aboutServiceAreasText?: string;
    aboutServiceAreasSubtitle?: string;
    aboutServiceAreasSubtext?: string;
    portfolioPageTitle?: string;
    portfolioPageSubtitle?: string;
}

export interface AdminSettings {
    id?: string;
    adminUsername?: string;
    adminEmail?: string;
}

export interface CompanyInfo {
    id?: string;
    ownerFullName?: string;
    ownerImageId?: string;
    ownerImageUrl?: string;
    contactPhoneNumber?: string;
    companyAddress?: string;
    mapEmbedUrl?: string;
    aboutUsContent?: string;
    instagramUrl?: string;
    facebookUrl?: string;
}

export interface Service {
    id: string;
    title: string;
    description: string;
    imageIds: string[];
    mainImageUrl?: string;
    displayOrder: number;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    imageId: string;
    imageUrl?: string;
    createdAt: string; // ISO date string
}

export interface Blog {
    id: string;
    title: string;
    slug: string;
    content: string;
    publishDate: string; // ISO date string
    author: string;
    metaDescription: string;
    keywords: string[];
    thumbnailImageId: string;
    thumbnailImageUrl?: string;
    isFeaturedOnHomepage: boolean;
}

export interface Image {
    id: string;
    url: string;
    altText: string;
    caption?: string;
    uploadDate: string; // ISO date string
    usageContext: string;
}

export interface Portfolio {
    id: string;
    title: string;
    description: string;
    imageId: string;
    imageUrl?: string;
    displayOrder: number;
    createdAt: string; // ISO date string
}

export interface SiteConfig {
    siteName: string;
    whatsappNumber: string;
    address: string;
    phone: string;
    email: string;
    mapUrl: string;
    ownerName: string;
    services: { id: string; title: string }[];
    instagramUrl?: string;
    facebookUrl?: string;
  }
    
