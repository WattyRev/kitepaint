/**
 * Deletes the design with the specified ID.
 * @param  {String}  designId
 * @return {Promise}
 */
export default async function deleteDesign(designId) {
  const data = {
    delete: true,
    id: designId
  };
  const bodyFormData = new FormData();
  Object.keys(data).forEach(key => bodyFormData.append(key, data[key]));

  const response = await this.axiosInstance.post("/designs.php", bodyFormData);

  // The server should respond with valid: true and with the id of the newly created design.
  if (!response.data || !response.data.valid) {
    return new Promise((resolve, reject) =>
      reject(
        response.data
          ? response.data.message
          : "The design could not be deleted"
      )
    );
  }

  return response;
}
