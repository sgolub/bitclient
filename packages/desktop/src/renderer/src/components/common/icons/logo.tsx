export default function Logo({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" className={className}>
      <path fill="#CCD6DD" d="M33 3c-7-3-15-3-15-3S10 0 3 3C0 18 3 31 18 36c15-5 18-18 15-33z" />
      <path
        fill="#55ACEE"
        d="M18 33.884C6.412 29.729 1.961 19.831 4.76 4.444 11.063 2.029 17.928 2 18 2c.071 0 6.958.04 13.24 2.444 2.799 15.387-1.652 25.285-13.24 29.44z"
      />
      <path
        fill="#269"
        d="M31.24 4.444C24.958 2.04 18.071 2 18 2v31.884c11.588-4.155 16.039-14.053 13.24-29.44z"
      />
    </svg>
  );
}
