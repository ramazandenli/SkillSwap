import { useCallback, useEffect, useRef, useState } from "react";

/**
 * "Veriyi cek, yuklenirken bekleme goster, hata olursa yakala" uclusu
 * neredeyse her panelde tekrar ediyordu. Bu kanca o kaliba tek bir yer veriyor.
 *
 * @param {Function} loader veri donduren async fonksiyon
 * @param {Array} deps degistiginde verinin yeniden cekilecegi degerler
 * @returns {{ data, loading, error, reload }}
 *
 * Kullanimi:
 *   const { data: skills, loading, reload } = useAsyncData(
 *     () => usersApi.getSkills(username, "has"),
 *     [username]
 *   );
 */
export function useAsyncData(loader, deps = []) {
  // loader her render'da yeni bir fonksiyon nesnesi oluyor. Onu dogrudan
  // bagimlilik yapsaydik effect sonsuz donguye girerdi; ref ile hep en
  // guncelini kullanip effect'i sadece deps'e bagliyoruz.
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  // deps dizisini effect'e dogrudan yaymak yerine metne ceviriyoruz:
  // React bagimlilik dizisinin uzunlugunun sabit kalmasini bekliyor.
  const depsKey = JSON.stringify(deps);

  useEffect(() => {
    // Hizli deps degisimlerinde onceki istek sonradan donup yeni veriyi
    // ezebilir. cancelled bayragi bu yaris durumunu engelliyor.
    let cancelled = false;

    setState((previous) => ({ ...previous, loading: true, error: null }));

    Promise.resolve(loaderRef.current())
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ data: null, loading: false, error: error.message });
      });

    return () => {
      cancelled = true;
    };
  }, [depsKey, reloadToken]);

  return { ...state, reload };
}
