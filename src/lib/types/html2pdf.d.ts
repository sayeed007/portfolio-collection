declare module 'html2pdf.js' {
    interface Options {
        margin?: number | number[];
        filename?: string;
        image?: { type?: string; quality?: number };
        html2canvas?: {
            scale?: number;
            useCORS?: boolean;
            allowTaint?: boolean;
            scrollX?: number;
            scrollY?: number;
        };
        jsPDF?: {
            unit?: string;
            format?: string;
            orientation?: string;
            compress?: boolean;
        };
    }

    interface Html2PdfInstance {
        set: (options: Options) => Html2PdfInstance;
        from: (element: HTMLElement) => Html2PdfInstance;
        save: () => Promise<void>;
        output: (type: 'blob') => Promise<Blob>;
    }

    const html2pdf: (element?: HTMLElement, options?: Options) => Html2PdfInstance;
    export default html2pdf;
} 