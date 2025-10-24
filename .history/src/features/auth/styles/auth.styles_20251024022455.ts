import { StyleSheet } from "react-native";

export const authStyles = StyleSheet.create({
  // gradient background
  bgGradient: {
    flex: 1,
  },
  centeredKV: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  bgGlow: {
    position: 'absolute',
    top: 60,
    left: -20,
    width: 250,
    height: 170,
    borderRadius: 100,
    opacity: 0.85,
  },

  // glass card
  formGlass: {
    backgroundColor: 'rgba(255, 255, 255, 1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },

  image: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginBottom: 26,
  },

  // labels & errors
  label: {
    fontSize: 13,
    marginBottom: 6,
    fontWeight: "800",
    color: '#000',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  errorText: {
    color: "#b91c1c",
    marginTop: -6,
    marginBottom: 10,
    fontSize: 12,
    fontWeight: '600',
  },

  // glass inputs
  inputGlass: {
    height: 44,
    borderColor: 'rgba(7, 71, 96, 0.77)',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    color: '#000',
    fontSize: 14,
  },

  // buttons
  btnPrimaryGlass: {
    backgroundColor: 'rgba(16, 185, 129, 0.98)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  btnPrimaryGlassText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  btnSecondaryGlass: {
    backgroundColor: 'rgba(37, 99, 235, 0.98)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  btnSecondaryGlassText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  btnLink: {
    marginTop: 15,
    backgroundColor: 'transparent',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnLinkText: {
    color: '#0ea5aaff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  loginBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },

  separator: {
    textAlign: "center",
    justifyContent: "center",
    marginVertical: 18,
    color: 'rgba(0,0,0,0.65)',
    fontWeight: '700',
    letterSpacing: 1,
  },
});
