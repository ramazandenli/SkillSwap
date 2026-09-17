/**
 * Express 4, async fonksiyonlarin firlattigi hatalari kendisi yakalamaz.
 * Bu yuzden eski kodda her endpoint kendi try/catch'ini tasiyordu; catch
 * bloklarinin cogu da hatayi res.json(error) ile istemciye geri yolluyordu
 * (yani veritabani hata detaylari disari siziyordu).
 *
 * Bu sarmalayici, olusan hatayi next()'e verip merkezi errorHandler'a
 * yonlendiriyor. Boylece controller'larda tek satir try/catch kalmiyor.
 *
 * @param {Function} handler async (req, res) => ...
 */
export function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
