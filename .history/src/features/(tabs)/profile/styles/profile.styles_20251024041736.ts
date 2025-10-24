import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
   pagePad: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100%',
  },

  // background glow
  bgGlow: {
    position: 'absolute',
    top: 60,
    left: -20,
    width: 250,
    height: 170,
    borderRadius: 100,
    opacity: 0.85,
  },

  // glass main card
  cardGlass: {
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },

  name_iconContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  userIcon: {
    marginBottom: 6,
    color: '#1f2937',
  },
  name: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0b1320',
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  subCardGlass: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0b1320',
  },

  // modal
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },

  modalFrame: {
    width: '88%',
    borderRadius: 18,
    padding: 3, // gradient frame
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 8 },
        shadowColor: '#000',
        shadowOpacity: 0.35,
        shadowRadius: 16,
      },
      android: { elevation: 10 }
    })
  },
  modalGlass: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 12,
    color: '#0b1320',
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  inputGlass: {
    height: 44,
    borderColor: 'rgba(0,0,0,0.15)',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    color: '#0b1320',
    fontSize: 14,
  },

  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  checkboxLabel: {
    color: '#0b1320',
    fontSize: 13,
  },

  btnPrimary: {
    backgroundColor: 'rgba(16, 185, 129, 0.98)', // emerald
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  
  btnSecondary: {
    backgroundColor: 'rgba(37, 99, 235, 0.98)', // blue
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  btnSecondaryText: {
    color: '#fff',
    fontWeight: '900',
    letterSpacing: 0.3,
  },
});
