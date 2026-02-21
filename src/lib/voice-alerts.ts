/**
 * Utilidad para notificaciones por voz (Web Speech API)
 */
export function notificarAlerta(mensaje: string) {
    if (typeof window === "undefined") return;

    const synth = window.speechSynthesis;
    if (!synth) return;

    // Cancelar locuciones previas para evitar acumulación
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(mensaje);
    utterance.lang = "es-ES";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    synth.speak(utterance);
}
